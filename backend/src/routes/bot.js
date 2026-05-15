const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('🤖 Bot request received');
    const { messages } = req.body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log('API Key exists:', !!apiKey);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: `אתה עוזר מקצועי לבניית כלי הערכה ומדידה בחינוך, בעברית.
כללים:
1. תמיד ענה בעברית בלבד.
2. לתלמידים א-ג: שאלות עם אמוג'י פנים (😊😐😞).
3. לתלמידים ד-ו: סולם 1-3.
4. לחטיבה/תיכון: ליקרט 1-5.
5. למורים/מנהלים: שאלות מקצועיות.
6. שאלות ממוקדות בנושא בלבד.
7. אם חסר מידע — שאל תחילה.`,
        messages: messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
      })
    });

    console.log('Claude status:', response.status);
    const data = await response.json();
    console.log('Claude response:', JSON.stringify(data).slice(0, 200));

    const text = data?.content?.[0]?.text || 'מצטערת, הייתה שגיאה. נסי שוב.';
    res.json({ text });

  } catch (err) {
    console.error('❌ Bot error:', err.message);
    res.status(500).json({ text: 'שגיאה בשרת. נסי שוב.' });
  }
});

module.exports = router;
