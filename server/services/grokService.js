const axios = require('axios');

// NOTE: Using Groq API because the provided key is a Groq key (gsk_...)
// If you want to use xAI Grok, ensure your key starts with 'xai-' and use 'https://api.x.ai/v1/chat/completions'
const AI_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const AI_API_KEY = process.env.GROK_API_KEY; // Using your gsk_ key here
const AI_MODEL = 'llama-3.3-70b-versatile'; // High-performance Groq model

/**
 * Analyze an emergency using AI (via Groq)
 */
const analyzeEmergency = async (type, title, description, location) => {
  try {
    const context = `${title}${description ? ': ' + description : ''}`;
    const locationStr = location
      ? `Room: ${location.room || 'N/A'}, Floor: ${location.floor || 'N/A'}, Area: ${location.area || 'N/A'}`
      : 'Location not specified';

    const prompt = `You are an emergency response AI for a hotel. Analyze this emergency and respond ONLY in valid JSON with no markdown, no code blocks, just raw JSON:
{
  "severity": "low" | "medium" | "high" | "critical",
  "category": "string describing the exact emergency category",
  "immediateActions": ["action1", "action2", "action3", "action4", "action5"],
  "estimatedResponseTime": "string like '5-10 minutes'",
  "additionalRisks": "string describing potential additional risks",
  "suggestedDepartments": ["dept1", "dept2"]
}

Emergency Type: ${type}
Context: ${context || 'No specific details provided'}
Location: ${locationStr}

Respond with ONLY the JSON object. No explanation, no markdown fences.`;

    const response = await axios.post(
      AI_API_URL,
      {
        model: AI_MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You are an emergency response expert. Always output strictly JSON. Use ONLY the provided context and location. If a location detail (like room number) is not provided, do NOT hallucinate or invent one. Instead, use terms like "the reported location" or "affected area".' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0,
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let text = response.data.choices[0].message.content;
    text = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    const parsed = JSON.parse(text);

    return {
      severity: parsed.severity || 'medium',
      category: parsed.category || `${type} emergency`,
      immediateActions: parsed.immediateActions || [
        'Assess the situation and ensure your own safety',
        'Call emergency services if needed',
        'Alert hotel management immediately',
        'Follow hotel emergency procedures',
        'Document all actions taken',
      ],
      estimatedResponseTime: parsed.estimatedResponseTime || '10-15 minutes',
      additionalRisks: parsed.additionalRisks || 'Unknown additional risks',
      suggestedDepartments: parsed.suggestedDepartments || ['Security', 'Management'],
    };
  } catch (error) {
    console.error('AI Analysis error:', error.response?.data || error.message);
    return {
      severity: 'medium',
      category: `${type} emergency`,
      immediateActions: [
        'Assess the situation and ensure your own safety',
        'Call emergency services (911) if life-threatening',
        'Alert hotel management and security immediately',
        'Evacuate affected areas if necessary',
        'Document all actions and report to manager',
      ],
      estimatedResponseTime: '10-15 minutes',
      additionalRisks: 'Unable to assess at this time',
      suggestedDepartments: ['Security', 'Management', 'Front Desk'],
    };
  }
};

/**
 * Chat with AI assistant for emergency guidance
 */
const chatWithAI = async (userMessage) => {
  try {
    const response = await axios.post(
      AI_API_URL,
      {
        model: AI_MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You are an emergency response assistant for hotel staff. Give concise, numbered, actionable advice. Max 150 words. No fluff. No markdown headers. Just numbered steps or a brief explanation.' 
          },
          { role: 'user', content: userMessage }
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI Chat error:', error.response?.data || error.message);
    return 'I apologize, I am currently unable to process your request. Please follow your hotel\'s standard emergency procedures and contact your supervisor immediately.';
  }
};

/**
 * Generate a post-mortem report (AI Debrief) for a resolved emergency
 */
const generatePostMortem = async (emergencyData) => {
  try {
    const timeline = JSON.stringify(emergencyData.timeline);
    const duration = new Date(emergencyData.updatedAt) - new Date(emergencyData.createdAt);
    const durationMins = Math.round(duration / 60000);

    const prompt = `You are an elite hotel crisis management consultant. Analyze the timeline of this RESOLVED emergency and provide a performance scorecard. respond ONLY in valid JSON with no markdown, no code blocks:
{
  "grade": "A+" | "A" | "B" | "C" | "F",
  "summary": "1-2 sentences summarizing the response quality",
  "efficiencyMetrics": {
    "responseTime": 0-100 score,
    "resolutionTime": 0-100 score,
    "staffCoordinationScore": 0-100 score
  },
  "improvements": ["suggestion1", "suggestion2"]
}

Emergency Type: ${emergencyData.type}
Emergency Title: ${emergencyData.title}
Total Duration: ${durationMins} minutes
Timeline Actions: ${timeline}

Respond with ONLY the JSON object.`;

    const response = await axios.post(
      AI_API_URL,
      {
        model: AI_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert hospitality consultant. Output strictly JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let text = response.data.choices[0].message.content;
    text = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Post-mortem error:', error.message);
    return {
      grade: 'N/A',
      summary: 'Automated analysis unavailable. Crisis resolved successfully.',
      efficiencyMetrics: { responseTime: 0, resolutionTime: 0, staffCoordinationScore: 0 },
      improvements: ['Ensure all timeline steps are logged for better future analysis.']
    };
  }
};

module.exports = { analyzeEmergency, chatWithAI, generatePostMortem };
