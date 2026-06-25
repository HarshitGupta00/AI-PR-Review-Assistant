const axios = require('axios');
const User = require('../models/User');
const Repo = require('../models/Repo');
const Review = require('../models/Review');

// GET /api/repos
// Returns all repos the authenticated user has connected, with PR review counts.
async function getRepos(req, res) {
  try {
    const repos = await Repo.find({ owner: req.userId }).sort({ createdAt: -1 });

    // Attach review counts per repo
    const repoIds = repos.map(r => r._id);
    const reviewCounts = await Review.aggregate([
      { $match: { repo: { $in: repoIds }, requestedBy: req.userId } },
      { $group: { _id: '$repo', count: { $sum: 1 }, lastReview: { $max: '$createdAt' } } },
    ]);

    const countMap = {};
    reviewCounts.forEach(rc => {
      countMap[rc._id.toString()] = { count: rc.count, lastReview: rc.lastReview };
    });

    const result = repos.map(repo => ({
      ...repo.toObject(),
      prsReviewed: countMap[repo._id.toString()]?.count || 0,
      lastReview: countMap[repo._id.toString()]?.lastReview || null,
    }));

    res.json(result);
  } catch (err) {
    console.error('getRepos error:', err.message);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
}

// POST /api/repos
// Connects a new GitHub repository to the user's account.
// Body: { fullName: "owner/repo" }
async function connectRepo(req, res) {
  const { fullName } = req.body;
  if (!fullName || !fullName.includes('/')) {
    return res.status(400).json({ error: 'fullName must be in "owner/repo" format' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch repo metadata from GitHub to validate it exists + get extra info
    let githubData = {};
    try {
      const ghRes = await axios.get(`https://api.github.com/repos/${fullName}`, {
        headers: { Authorization: `Bearer ${user.githubAccessToken}` },
      });
      githubData = {
        githubRepoId: String(ghRes.data.id),
        isPrivate: ghRes.data.private,
        description: ghRes.data.description,
        language: ghRes.data.language,
        defaultBranch: ghRes.data.default_branch,
        stargazersCount: ghRes.data.stargazers_count,
      };
    } catch {
      // If GitHub fetch fails, still allow manual connection with minimal data
      githubData = { githubRepoId: fullName };
    }

    const repo = await Repo.findOneAndUpdate(
      { owner: req.userId, fullName },
      { owner: req.userId, fullName, ...githubData },
      { upsert: true, new: true }
    );

    res.status(201).json(repo);
  } catch (err) {
    console.error('connectRepo error:', err.message);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Repository already connected' });
    }
    res.status(500).json({ error: 'Failed to connect repository' });
  }
}

// DELETE /api/repos/:id
// Disconnects a repository (does NOT delete reviews).
async function disconnectRepo(req, res) {
  try {
    const repo = await Repo.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId, // ensure ownership
    });
    if (!repo) return res.status(404).json({ error: 'Repository not found' });
    res.json({ message: 'Repository disconnected' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to disconnect repository' });
  }
}

module.exports = { getRepos, connectRepo, disconnectRepo };
