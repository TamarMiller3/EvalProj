const express = require('express');
const router = express.Router();
const repo = require('../storage/controller');

// ✅ check if code exists
router.get('/check/:code', async (req, res) => {
    try {
        const data = await repo.getEvaluation(req.params.code);
        return res.json({ exists: !!data });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// ✅ load evaluation
router.get('/:code', async (req, res) => {
    try {
        const doc = await repo.getEvaluation(req.params.code);
        if (!doc) return res.status(404).json({ error: 'קוד לא נמצא' });
        return res.json(doc);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// ✅ create (בדיוק כמו שהיה — עם בדיקה לפני)
router.post('/', async (req, res) => {
    const { code, userName, userSchool, userPrincipal } = req.body;

    if (!code || !userName || !userSchool)
        return res.status(400).json({ error: 'חסרים שדות חובה' });

    try {
        const exists = await repo.getEvaluation(code);
        if (exists)
            return res.status(409).json({ error: 'קוד זה כבר תפוס' });

        await repo.createEvaluation({
            userCode: code,
            userName,
            userSchool,
            fields: {},
            checks: {},
            scales: {},
            notes: {},
            decision: ''
        });

        return res.status(201).json({ success: true, code: code.toUpperCase() });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// ✅ update (כמו set שהיה)
router.put('/:code', async (req, res) => {
    const body = req.body;

    if (!body)
        return res.status(400).json({ error: 'אין נתונים לשמירה' });
    try {
        await repo.updateEvaluation(req.params.code, body);
        return res.json({ success: true });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});
 
module.exports = router;
