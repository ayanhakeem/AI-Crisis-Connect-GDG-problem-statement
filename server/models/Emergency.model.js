const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['fire', 'medical', 'security', 'other'],
      required: [true, 'Emergency type is required'],
    },
    title: {
      type: String,
      required: [true, 'Emergency title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      room: String,
      floor: String,
      area: String,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['active', 'responding', 'resolved'],
      default: 'active',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    aiSuggestion: String,
    aiCategory: String,
    immediateActions: [String],
    estimatedResponseTime: String,
    additionalRisks: String,
    suggestedDepartments: [String],
    timeline: [
      {
        action: String,
        by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    postMortemReport: {
      grade: String,
      summary: String,
      efficiencyMetrics: {
        responseTime: Number,
        resolutionTime: Number,
        staffCoordinationScore: Number,
      },
      improvements: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Emergency', emergencySchema);
