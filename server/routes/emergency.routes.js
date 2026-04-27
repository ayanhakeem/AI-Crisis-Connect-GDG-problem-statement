const express = require('express');
const router = express.Router();
const {
  createEmergency,
  getEmergencies,
  getStats,
  getEmergencyById,
  updateStatus,
  assignStaff,
} = require('../controllers/emergency.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(protect);

router.post('/', createEmergency);
router.get('/', getEmergencies);
router.get('/stats', requireRole('admin'), getStats);
router.get('/:id', getEmergencyById);
router.patch('/:id/status', updateStatus);
router.patch('/:id/assign', requireRole('admin'), assignStaff);

module.exports = router;
