const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini AI is currently unavailable (API Key missing).' });
    }

    // Format history for the Gemini SDK if provided
    let contents = [];
    
    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: "You are a helpful and friendly AI assistant for an Internship Portal. You help students find internships, navigate the site, provide advice on applying to internships, and explain features like the dashboard and application process. Keep your responses concise, clear, and encouraging.",
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate a reply.' });
  }
});

module.exports = router;
