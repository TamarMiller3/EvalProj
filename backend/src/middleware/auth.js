const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

function adminAuth(req, res, next) {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'סיסמה שגויה' });
  }
  next();
}

function adminAuthHeader(req, res, next) {
  const auth = req.headers['x-admin-password'];
  if (auth !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

module.exports = { adminAuth, adminAuthHeader };
