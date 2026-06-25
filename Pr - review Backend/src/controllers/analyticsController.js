const mongoose = require('mongoose');
const Review = require('../models/Review');

// GET /api/analytics/summary
// Returns aggregated review stats for the authenticated user.
async function getAnalyticsSummary(req, res) {
  // req.userId is a plain string from JWT — aggregation $match requires ObjectId
  const userId = new mongoose.Types.ObjectId(req.userId);

  try {
    // 1. Total stats
    const totals = await Review.aggregate([
      { $match: { requestedBy: userId } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          totalIssues: { $sum: { $size: { $ifNull: ['$result.issues', []] } } },
          completedReviews: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
    ]);

    // 2. Critical issues count
    const criticalCount = await Review.aggregate([
      { $match: { requestedBy: userId, status: 'completed' } },
      { $unwind: { path: '$result.issues', preserveNullAndEmptyArrays: false } },
      { $match: { 'result.issues.severity': 'critical' } },
      { $count: 'total' },
    ]);

    // 3. Reviews per week (last 8 weeks)
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const weeklyReviews = await Review.aggregate([
      { $match: { requestedBy: userId, createdAt: { $gte: eightWeeksAgo } } },
      {
        $group: {
          _id: { $isoWeek: '$createdAt' },
          year: { $first: { $isoWeekYear: '$createdAt' } },
          reviews: { $sum: 1 },
        },
      },
      { $sort: { year: 1, '_id': 1 } },
    ]);

    // 4. Issue distribution by category
    const issueDistribution = await Review.aggregate([
      { $match: { requestedBy: userId, status: 'completed' } },
      { $unwind: { path: '$result.issues', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$result.issues.category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 5. Average review time (createdAt -> updatedAt for completed reviews, approximate)
    const avgTimeResult = await Review.aggregate([
      { $match: { requestedBy: userId, status: 'completed' } },
      {
        $project: {
          durationMs: { $subtract: ['$updatedAt', '$createdAt'] },
        },
      },
      { $group: { _id: null, avgMs: { $avg: '$durationMs' } } },
    ]);

    // 6. Repository health scores (avg score per repo for completed reviews)
    const repoHealth = await Review.aggregate([
      { $match: { requestedBy: userId, status: 'completed', 'result.score': { $exists: true } } },
      {
        $group: {
          _id: '$repo',
          avgScore: { $avg: '$result.score' },
          reviewCount: { $sum: 1 },
        },
      },
      { $sort: { avgScore: -1 } },
      {
        $lookup: {
          from: 'repos',
          localField: '_id',
          foreignField: '_id',
          as: 'repoInfo',
        },
      },
      { $unwind: '$repoInfo' },
      {
        $project: {
          fullName: '$repoInfo.fullName',
          score: { $round: ['$avgScore', 0] },
          reviewCount: 1,
        },
      },
    ]);

    const stats = totals[0] || { totalReviews: 0, totalIssues: 0, completedReviews: 0 };

    res.json({
      totalReviews: stats.totalReviews,
      totalIssues: stats.totalIssues,
      criticalIssues: criticalCount[0]?.total || 0,
      avgReviewTimeSec: avgTimeResult[0]
        ? Math.round(avgTimeResult[0].avgMs / 1000)
        : 0,
      weeklyReviews: weeklyReviews.map(w => ({
        week: `W${w._id}`,
        reviews: w.reviews,
      })),
      issueDistribution: issueDistribution.map(d => ({
        category: d._id,
        count: d.count,
      })),
      repoHealth,
    });
  } catch (err) {
    console.error('getAnalyticsSummary error:', err.message);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

module.exports = { getAnalyticsSummary };
