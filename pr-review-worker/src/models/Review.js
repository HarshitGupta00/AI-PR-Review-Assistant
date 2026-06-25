const mongoose = require('mongoose');

// IMPORTANT: this schema must stay in sync with the same file in
// pr-review-backend. Both repos read/write the same MongoDB
// collection. In a larger system this duplication would be solved
// by extracting shared schemas into a private npm package; for this
// project's scope, two small files kept in sync manually is a
// reasonable, explainable tradeoff.
const reviewSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    repo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repo',
      required: true,
    },
    pullRequestNumber: { type: Number, required: true },
    pullRequestTitle: { type: String },

    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },

    // Review config set by the user on Create Review page
    config: {
      model: { type: String, default: 'gemini-flash' },
      contextMode: { type: String, default: 'repo-aware' },
      checks: {
        bugs: { type: Boolean, default: true },
        security: { type: Boolean, default: true },
        performance: { type: Boolean, default: true },
        codeStyle: { type: Boolean, default: true },
        testCoverage: { type: Boolean, default: false },
      },
    },

    // Raw diff text (kept for debugging / re-running without re-fetching)
    diff: { type: String },

    // Structured AI output
    result: {
      summary: { type: String },
      score: { type: Number, min: 0, max: 100 }, // 0-100 overall code quality score
      riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
      },
      issues: [
        {
          title: { type: String },         // short title e.g. "SQL Injection Risk"
          file: { type: String },
          line: { type: Number },
          severity: {
            type: String,
            enum: ['info', 'minor', 'major', 'critical'],
          },
          category: {
            type: String,
            enum: ['bug', 'style', 'performance', 'security', 'test-coverage'],
          },
          comment: { type: String },       // AI explanation (1-3 sentences)
          codeSnippet: { type: String },   // the problematic code block
          suggestedFix: { type: String },  // the corrected code block
          confidence: { type: Number, min: 0, max: 100 }, // AI confidence %
        },
      ],
    },

    errorMessage: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);