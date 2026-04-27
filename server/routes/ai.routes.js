const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.post('/chat', chat);

module.exports = router;
