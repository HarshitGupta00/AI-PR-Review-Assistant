const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { getAnalyticsSummary } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/summary', requireAuth, getAnalyticsSummary); // GET /api/analytics/summary

module.exports = router;
