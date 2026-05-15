const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('🤖 Bot request received');
    const { messages } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key exists:', !!apiKey);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: `אתה מומחה פדגוגי בכיר לתחום המדידה והערכה בחינוך. עזור לאנשי חינוך להגדיר יעדי SMART, לבחור כלי הערכה (מחוונים, סקרים, תלקיטים) ולנסח אותם בפועל. זכור: אם המשתמש מזין שמות או פרטים אישיים של תלמידים, עליך להתריע מיד שאסור להזין מידע רגיש ולבקש לנסח מחדש באנונימיות.` }]
          },
          contents: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          }))
        })
      }
    );

    console.log('Gemini status:', response.status);
    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data).slice(0, 200));

    if (!response.ok) {
      console.error('Gemini error:', data);
      return res.status(500).json({ text: 'מצטערת, הייתה שגיאה. נסי שוב.' });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'מצטערת, הייתה שגיאה. נסי שוב.';
    res.json({ text });

  } catch (err) {
    console.error('❌ Bot error:', err.message);
    res.status(500).json({ text: 'שגיאה בשרת. נסי שוב.' });
  }
});

module.exports = router;
