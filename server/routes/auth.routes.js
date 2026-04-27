const express = require('express');
const router = express.Router();
const { register, login, getMe, getAllStaff, toggleStaffStatus } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.post('/login', login);
router.post('/register', protect, requireRole('admin'), register);
router.get('/me', protect, getMe);
router.get('/staff', protect, getAllStaff);
router.patch('/staff/:id/toggle', protect, requireRole('admin'), toggleStaffStatus);

module.exports = router;
