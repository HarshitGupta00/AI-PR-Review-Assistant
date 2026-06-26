const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { getMe, deleteAccount } = require('../controllers/userController');

const router = express.Router();

router.get('/me', requireAuth, getMe); // GET /api/users/me
router.delete('/me', requireAuth, deleteAccount); // DELETE /api/users/me

module.exports = router;
