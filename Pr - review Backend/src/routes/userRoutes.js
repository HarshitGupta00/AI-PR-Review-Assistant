const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { getMe } = require('../controllers/userController');

const router = express.Router();

router.get('/me', requireAuth, getMe); // GET /api/users/me

module.exports = router;
