const mongoose = require('mongoose');
const Review = require('../models/Review');

// GET /api/analytics/summary
// Returns aggregated review stats for the authenticated user.
async function getAnalyticsSummary(req, res) {
  // req.userId is a plain string from JWT — aggregation $match requires ObjectId
  const userId = new mongoose.Types.ObjectId(req.userId);

  try {
    // 1. Total stats (including average score and distinct repos)
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
          reposReviewed: { $addToSet: '$repo' },
          avgScore: {
            $avg: { $cond: [{ $eq: ['$status', 'completed'] }, '$result.score', null] }
          },
        },
      },
      {
        $project: {
          totalReviews: 1,
          totalIssues: 1,
          completedReviews: 1,
          reposReviewed: { $size: '$reposReviewed' },
          avgScore: { $round: ['$avgScore', 1] },
        }
      }
    ]);

    // 2. Critical issues count
    const criticalCount = await Review.aggregate([
      { $match: { requestedBy: userId, status: 'completed' } },
      { $unwind: { path: '$result.issues', preserveNullAndEmptyArrays: false } },
      { $match: { 'result.issues.severity': 'critical' } },
      { $count: 'total' },
    ]);

    // 3. Issue distribution by category
    const issueDistribution = await Review.aggregate([
      { $match: { requestedBy: userId, status: 'completed' } },
      { $unwind: { path: '$result.issues', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$result.issues.category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 4. Average review time (createdAt -> updatedAt for completed reviews, approximate)
    const avgTimeResult = await Review.aggregate([
      { $match: { requestedBy: userId, status: 'completed' } },
      {
        $project: {
          durationMs: { $subtract: ['$updatedAt', '$createdAt'] },
        },
      },
      { $group: { _id: null, avgMs: { $avg: '$durationMs' } } },
    ]);

    // 5. Repository health scores (avg score per repo for completed reviews)
    const repoHealth = await Review.aggregate([
      { $match: { requestedBy: userId, status: 'completed', 'result.score': { $exists: true } } },
      {
        $group: {
          _id: '$repo',
          avgScore: { $avg: '$result.score' },
          reviewCount: { $sum: 1 },
          totalIssues: { $sum: { $size: { $ifNull: ['$result.issues', []] } } },
        },
      },
      { $sort: { reviewCount: -1, avgScore: -1 } },
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
          language: '$repoInfo.language',
          score: { $round: ['$avgScore', 0] },
          reviewCount: 1,
          totalIssues: 1,
        },
      },
    ]);

    // 6. All reviews data for frontend aggregation (trends and scores)
    const allReviews = await Review.find({ requestedBy: userId, status: 'completed' })
      .select('createdAt result.score')
      .sort({ createdAt: 1 });
    
    const reviewDates = allReviews.map(r => r.createdAt);
    const scoreTrends = allReviews.map(r => ({ date: r.createdAt, score: r.result?.score || 0 }));

    const stats = totals[0] || { totalReviews: 0, totalIssues: 0, completedReviews: 0, reposReviewed: 0, avgScore: 0 };
    
    // Sort repoHealth by score for the health table, but keep the top one by reviewCount for Most Reviewed
    const mostReviewedRepo = repoHealth.length > 0 ? repoHealth[0] : null;
    const sortedRepoHealth = [...repoHealth].sort((a, b) => b.score - a.score);

    res.json({
      totalReviews: stats.totalReviews,
      totalIssues: stats.totalIssues,
      criticalIssues: criticalCount[0]?.total || 0,
      reposReviewed: stats.reposReviewed,
      averageScore: stats.avgScore || 0,
      avgReviewTimeSec: avgTimeResult[0] ? Math.round(avgTimeResult[0].avgMs / 1000) : 0,
      issueDistribution: issueDistribution.map(d => ({
        category: d._id,
        count: d.count,
      })),
      repoHealth: sortedRepoHealth,
      mostReviewedRepo,
      reviewDates,
      scoreTrends,
    });
  } catch (err) {
    console.error('getAnalyticsSummary error:', err.message);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

module.exports = { getAnalyticsSummary };
