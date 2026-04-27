const { chatWithAI } = require('../services/grokService');

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const reply = await chatWithAI(message.trim());
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { chat };
