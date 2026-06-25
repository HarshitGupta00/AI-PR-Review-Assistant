const mongoose = require('mongoose');

const repoSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    githubRepoId: { type: String, required: true },
    fullName: { type: String, required: true }, // e.g. "octocat/Hello-World"
    isPrivate: { type: Boolean, default: false },
    description: { type: String },
    language: { type: String },      // e.g. "TypeScript"
    defaultBranch: { type: String, default: 'main' },
    stargazersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

repoSchema.index({ owner: 1, githubRepoId: 1 }, { unique: true });

module.exports = mongoose.model('Repo', repoSchema);