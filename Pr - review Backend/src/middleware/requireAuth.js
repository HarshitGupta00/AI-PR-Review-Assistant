const jwt = require('jsonwebtoken');

// Verifies the session_token cookie on protected routes.
// On success, attaches req.userId for downstream handlers to use.
function requireAuth(req, res, next) {
  const token = req.cookies.session_token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

module.exports = requireAuth;