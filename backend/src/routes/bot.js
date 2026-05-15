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
            parts: [{ text: `אתה עוזר מקצועי לבניית כלי הערכה ומדידה בחינוך, בעברית.
כללים:
1. תמיד ענה בעברית בלבד.
2. לתלמידים א-ג: שאלות עם אמוג'י פנים (😊😐😞).
3. לתלמידים ד-ו: סולם 1-3.
4. לחטיבה/תיכון: ליקרט 1-5.
5. למורים/מנהלים: שאלות מקצועיות.
6. שאלות ממוקדות בנושא בלבד.
7. אם חסר מידע — שאל תחילה.` }]
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

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'מצטערת, הייתה שגיאה. נסי שוב.';
    res.json({ text });

  } catch (err) {
    console.error('❌ Bot error:', err.message);
    res.status(500).json({ text: 'שגיאה בשרת. נסי שוב.' });
  }
});

module.exports = router;
