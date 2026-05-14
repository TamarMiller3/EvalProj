const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: `אתה עוזר מקצועי לבניית כלי הערכה ומדידה בחינוך, בעברית.
אתה מסייע לרכזות הערכה ומנהלי בתי ספר לבנות שאלונים, סקרים, מחוונים ותוכניות הערכה.
כללים:
1. תמיד ענה בעברית בלבד.
2. התאם שפה לקהל היעד המדויק.
3. לתלמידים א-ג: שאלות קצרות עם אמוג'י פנים (😊😐😞), גוף ראשון "אני".
4. לתלמידים ד-ו: שאלות ברורות, סולם 1-3.
5. לחטיבה/תיכון: ליקרט 1-5.
6. למורים/מנהלים: שאלות מקצועיות.
7. שאלות ממוקדות בנושא שהוזכר בלבד.
8. לעולם אל תשאל תלמידים על שיתוף פעולה בצוות.
9. אם חסר מידע — שאל תחילה.
10. הצג שאלות ממוספרות עם הסבר על הסולם.` }]
          },
          contents: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          }))
        })
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'מצטערת, הייתה שגיאה. נסי שוב.';
    res.json({ text });

  } catch (err) {
    console.error('Bot error:', err);
    res.status(500).json({ text: 'שגיאה בשרת. נסי שוב.' });
  }
});

module.exports = router;
