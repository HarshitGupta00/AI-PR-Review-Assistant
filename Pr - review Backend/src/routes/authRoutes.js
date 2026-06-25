const express = require('express');
const { redirectToGithub, handleGithubCallback } = require('../controllers/authController');

const router = express.Router();

router.get('/github', redirectToGithub);
router.get('/github/callback', handleGithubCallback);

module.exports = router;