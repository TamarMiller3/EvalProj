const express = require('express');
const router  = express.Router();
const store   = require('../storage/store');

// GET /api/evaluations/check/:code — check if code exists
router.get('/check/:code', async (req, res) => {
  try {
    const exists = await store.exists(req.params.code);
    return res.json({ exists });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /api/evaluations/:code — load evaluation by code
router.get('/:code', async (req, res) => {
  try {
    const doc = await store.get(req.params.code);
    if (!doc) return res.status(404).json({ error: 'קוד לא נמצא' });
    return res.json(doc);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// POST /api/evaluations — create new evaluation
router.post('/', async (req, res) => {
  const { code, userName, userSchool } = req.body;
  if (!code || !userName || !userSchool)
    return res.status(400).json({ error: 'חסרים שדות חובה' });
  try {
    if (await store.exists(code))
      return res.status(409).json({ error: 'קוד זה כבר תפוס' });
    await store.set(code, { code, userName, userSchool });
    return res.status(201).json({ success: true, code: code.toUpperCase() });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// PUT /api/evaluations/:code — save / update evaluation
router.put('/:code', async (req, res) => {
  const body = req.body;
  if (!body) return res.status(400).json({ error: 'אין נתונים לשמירה' });
  try {
    await store.set(req.params.code, body);
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
