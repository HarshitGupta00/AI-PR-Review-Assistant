const mongoose = require('mongoose');

// Stores the logged-in user's GitHub identity + the access token
// we need to call GitHub's API on their behalf.
const userSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true, // one user doc per GitHub account
    },
    username: { type: String, required: true },
    avatarUrl: { type: String },

    // GitHub OAuth access token, used to call GitHub API as this user.
    // NOTE: in a real production system you'd encrypt this at rest.
    githubAccessToken: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);