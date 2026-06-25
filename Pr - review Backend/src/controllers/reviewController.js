const axios = require('axios');
const User = require('../models/User');
const Repo = require('../models/Repo');
const Review = require('../models/Review');
const reviewQueue = require('../queues/reviewQueue');

// POST /api/reviews
// Body: { repoFullName, pullRequestNumber, config? }
async function requestReview(req, res) {
  const { repoFullName, pullRequestNumber, config } = req.body;

  if (!repoFullName || !pullRequestNumber) {
    return res.status(400).json({ error: 'repoFullName and pullRequestNumber are required' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch the PR diff from GitHub
    const diffRes = await axios.get(
      `https://api.github.com/repos/${repoFullName}/pulls/${pullRequestNumber}`,
      {
        headers: {
          Authorization: `Bearer ${user.githubAccessToken}`,
          Accept: 'application/vnd.github.v3.diff',
        },
      }
    );

    const diff = diffRes.data;

    // Also fetch PR title for display purposes
    let pullRequestTitle = null;
    try {
      const prMeta = await axios.get(
        `https://api.github.com/repos/${repoFullName}/pulls/${pullRequestNumber}`,
        { headers: { Authorization: `Bearer ${user.githubAccessToken}` } }
      );
      pullRequestTitle = prMeta.data.title;
    } catch {
      // title is optional
    }

    // Find or create the Repo doc
    let repo = await Repo.findOne({ owner: user._id, fullName: repoFullName });
    if (!repo) {
      repo = await Repo.create({
        owner: user._id,
        githubRepoId: repoFullName,
        fullName: repoFullName,
      });
    }

    const review = await Review.create({
      requestedBy: user._id,
      repo: repo._id,
      pullRequestNumber,
      pullRequestTitle,
      diff,
      status: 'pending',
      config: config || {},
    });

    await reviewQueue.add(
      'process-review',
      { reviewId: review._id.toString() },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      }
    );

    res.status(202).json({
      message: 'Review queued',
      reviewId: review._id,
    });
  } catch (err) {
    console.error('requestReview error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to queue review' });
  }
}

// GET /api/reviews
// Returns a paginated list of reviews for the current user (no diff field).
async function listReviews(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip  = parseInt(req.query.skip) || 0;

    const reviews = await Review.find({ requestedBy: req.userId })
      .select('-diff') // diff is large; don't return it in the list
      .populate('repo', 'fullName isPrivate')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Review.countDocuments({ requestedBy: req.userId });

    res.json({ reviews, total, limit, skip });
  } catch (err) {
    console.error('listReviews error:', err.message);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

// GET /api/reviews/:id
async function getReview(req, res) {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      requestedBy: req.userId, // ensure ownership
    })
      .select('-diff')
      .populate('repo', 'fullName isPrivate');

    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch review' });
  }
}

module.exports = { requestReview, listReviews, getReview };