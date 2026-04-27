const Emergency = require('../models/Emergency.model');
const User = require('../models/User.model');
const { analyzeEmergency, generatePostMortem } = require('../services/grokService');

// @desc    Create emergency
// @route   POST /api/emergencies
const createEmergency = async (req, res) => {
  try {
    const { type, title, description, location } = req.body;

    // Run AI analysis
    const aiResult = await analyzeEmergency(type, description, location);

    // Auto-suggest nearest available staff by department
    const suggestedStaff = await User.find({
      department: { $in: aiResult.suggestedDepartments },
      isActive: true,
      _id: { $ne: req.user._id },
    }).limit(3);

    const emergency = await Emergency.create({
      type,
      title,
      description,
      location,
      severity: aiResult.severity,
      reportedBy: req.user._id,
      assignedTo: suggestedStaff.map((s) => s._id),
      aiCategory: aiResult.category,
      immediateActions: aiResult.immediateActions,
      estimatedResponseTime: aiResult.estimatedResponseTime,
      additionalRisks: aiResult.additionalRisks,
      suggestedDepartments: aiResult.suggestedDepartments,
      timeline: [{ action: 'Emergency reported', by: req.user._id }],
    });

    const populated = await Emergency.findById(emergency._id)
      .populate('reportedBy', 'name email department')
      .populate('assignedTo', 'name email department')
      .populate('timeline.by', 'name');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('emergency:new', populated);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all emergencies
// @route   GET /api/emergencies
const getEmergencies = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    } else if (req.user.role === 'staff') {
      // Default for staff (when no specific filter is active) is to hide resolved
      filter.status = { $ne: 'resolved' };
    }

    if (type && type !== 'all') filter.type = type;

    const skip = (page - 1) * limit;
    const total = await Emergency.countDocuments(filter);

    const emergencies = await Emergency.find(filter)
      .populate('reportedBy', 'name email department')
      .populate('assignedTo', 'name email department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ emergencies, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics stats
// @route   GET /api/emergencies/stats
const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [activeCount, resolvedToday, byType, last7Days, lastResolved] = await Promise.all([
      Emergency.countDocuments({ status: { $ne: 'resolved' } }),
      Emergency.countDocuments({ status: 'resolved', updatedAt: { $gte: today, $lt: tomorrow } }),
      Emergency.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Emergency.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Emergency.find({ status: 'resolved' })
        .populate('reportedBy', 'name')
        .sort({ updatedAt: -1 })
        .limit(10),
    ]);

    // Calculate avg response time (difference between createdAt and last updatedAt for resolved)
    const resolvedEmergencies = await Emergency.find({ status: 'resolved' });
    let avgResponseMs = 0;
    if (resolvedEmergencies.length > 0) {
      const total = resolvedEmergencies.reduce((sum, e) => {
        return sum + (new Date(e.updatedAt) - new Date(e.createdAt));
      }, 0);
      avgResponseMs = total / resolvedEmergencies.length;
    }
    const avgResponseMinutes = Math.round(avgResponseMs / 60000);

    res.json({
      activeCount,
      resolvedToday,
      avgResponseMinutes,
      byType,
      last7Days,
      lastResolved,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single emergency
// @route   GET /api/emergencies/:id
const getEmergencyById = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate('reportedBy', 'name email department')
      .populate('assignedTo', 'name email department')
      .populate('timeline.by', 'name department');

    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });

    res.json(emergency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update status
// @route   PATCH /api/emergencies/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });

    emergency.status = status;
    emergency.timeline.push({
      action: `Status changed to ${status}`,
      by: req.user._id,
    });

    // If resolved, generate post-mortem report
    if (status === 'resolved') {
      try {
        const report = await generatePostMortem(emergency);
        emergency.postMortemReport = report;
      } catch (error) {
        console.error('Failed to generate post-mortem:', error);
      }
    }

    await emergency.save();

    const populated = await Emergency.findById(emergency._id)
      .populate('reportedBy', 'name email department')
      .populate('assignedTo', 'name email department')
      .populate('timeline.by', 'name');

    const io = req.app.get('io');
    if (io) io.emit('emergency:updated', populated);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign staff
// @route   PATCH /api/emergencies/:id/assign
const assignStaff = async (req, res) => {
  try {
    const { staffIds } = req.body;
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });

    emergency.assignedTo = staffIds;
    emergency.timeline.push({
      action: `Staff assignment updated`,
      by: req.user._id,
    });

    await emergency.save();

    const populated = await Emergency.findById(emergency._id)
      .populate('reportedBy', 'name email department')
      .populate('assignedTo', 'name email department')
      .populate('timeline.by', 'name');

    const io = req.app.get('io');
    if (io) io.emit('emergency:updated', populated);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createEmergency, getEmergencies, getStats, getEmergencyById, updateStatus, assignStaff };
