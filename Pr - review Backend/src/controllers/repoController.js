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

// GET /api/repos/validate/:owner/:repo
// Validates a GitHub repo exists and returns metadata for the preview card.
async function validateRepo(req, res) {
  const fullName = `${req.params.owner}/${req.params.repo}`;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const ghRes = await axios.get(`https://api.github.com/repos/${fullName}`, {
      headers: { Authorization: `Bearer ${user.githubAccessToken}` },
    });

    const d = ghRes.data;
    res.json({
      valid: true,
      fullName: d.full_name,
      owner: d.owner?.login,
      avatarUrl: d.owner?.avatar_url,
      description: d.description,
      language: d.language,
      defaultBranch: d.default_branch,
      stargazersCount: d.stargazers_count,
      forksCount: d.forks_count,
      isPrivate: d.private,
      updatedAt: d.updated_at,
      openIssuesCount: d.open_issues_count,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ valid: false, reason: 'not_found' });
    }
    if (err.response?.status === 403) {
      return res.status(403).json({ valid: false, reason: 'access_denied' });
    }
    res.status(500).json({ valid: false, reason: 'unknown' });
  }
}

// GET /api/repos/search?q=keyword
// Searches GitHub repositories for auto-complete.
async function searchRepos(req, res) {
  const q = req.query.q;
  if (!q || q.length < 2) {
    return res.json({ items: [] });
  }
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const ghRes = await axios.get('https://api.github.com/search/repositories', {
      headers: { Authorization: `Bearer ${user.githubAccessToken}` },
      params: { q, per_page: 6, sort: 'stars', order: 'desc' },
    });

    const items = ghRes.data.items.map(r => ({
      fullName: r.full_name,
      owner: r.owner?.login,
      avatarUrl: r.owner?.avatar_url,
      description: r.description,
      language: r.language,
      stargazersCount: r.stargazers_count,
      isPrivate: r.private,
    }));

    res.json({ items });
  } catch (err) {
    console.error('searchRepos error:', err.message);
    res.json({ items: [] });
  }
}

module.exports = { getRepos, connectRepo, disconnectRepo, validateRepo, searchRepos };
