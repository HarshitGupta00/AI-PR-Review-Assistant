const User = require('../models/User');
const Review = require('../models/Review');
const Repo = require('../models/Repo');

// GET /api/users/me
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

// DELETE /api/users/me
// Deletes the currently authenticated user and all associated data (repos, reviews).
async function deleteAccount(req, res) {
  try {
    const userId = req.userId;
    
    // First verify user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Delete all reviews requested by the user
    await Review.deleteMany({ requestedBy: userId });
    
    // Delete all repositories tracked by the user
    await Repo.deleteMany({ owner: userId });
    
    // Finally, delete the user
    await User.findByIdAndDelete(userId);

    // Also clear the JWT cookie
    res.clearCookie('token');

    res.json({ message: 'Account and all associated data successfully deleted' });
  } catch (err) {
    console.error('Failed to delete account:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
}

module.exports = { getMe, deleteAccount };
