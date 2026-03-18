const express  = require('express');
const router   = express.Router();
const store    = require('../storage/store');
const { adminAuthHeader } = require('../middleware/auth');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'RAMA2025';

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD)
    return res.status(401).json({ error: 'סיסמה שגויה' });
  return res.json({ success: true });
});

// GET /api/admin/entries — all evaluations (admin only)
router.get('/entries', adminAuthHeader, async (req, res) => {
  try {
    const entries = await store.listAll();
    return res.json(entries);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// DELETE /api/admin/entries/:code
router.delete('/entries/:code', adminAuthHeader, async (req, res) => {
  try {
    await store.delete(req.params.code);
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
