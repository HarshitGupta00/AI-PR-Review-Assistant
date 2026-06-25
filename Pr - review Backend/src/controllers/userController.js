const User = require('../models/User');

// GET /api/me
// Returns the currently authenticated user's profile.
async function getMe(req, res) {
  try {
    const user = await User.findById(req.userId).select('-githubAccessToken');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

module.exports = { getMe };
