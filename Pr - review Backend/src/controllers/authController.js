const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Step 1: redirect the user to GitHub's OAuth consent screen.
function redirectToGithub(req, res) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: 'repo read:user',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}

// Step 2: GitHub redirects here with a temporary `code`.
// We exchange it server-to-server for a real access token.
async function handleGithubCallback(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing OAuth code from GitHub' });
  }

  try {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const { access_token } = tokenRes.data;
    if (!access_token) {
      return res.status(400).json({ error: 'Failed to obtain access token' });
    }

    const profileRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id: githubId, login: username, avatar_url: avatarUrl } = profileRes.data;

    const user = await User.findOneAndUpdate(
      { githubId: String(githubId) },
      {
        githubId: String(githubId),
        username,
        avatarUrl,
        githubAccessToken: access_token,
      },
      { upsert: true, new: true }
    );

    const sessionToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.FRONTEND_URL}?login=success`);
  } catch (err) {
    console.error('GitHub OAuth error:', err.response?.data || err.message);
    res.status(500).json({ error: 'GitHub authentication failed' });
  }
}

module.exports = { redirectToGithub, handleGithubCallback };