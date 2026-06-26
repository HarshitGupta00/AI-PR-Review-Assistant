const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { listReviews, requestReview, getReview, deleteReview } = require('../controllers/reviewController');

const router = express.Router();

router.get('/', requireAuth, listReviews);       // GET  /api/reviews
router.post('/', requireAuth, requestReview);    // POST /api/reviews
router.get('/:id', requireAuth, getReview);      // GET  /api/reviews/:id
router.delete('/:id', requireAuth, deleteReview); // DELETE /api/reviews/:id

module.exports = router;