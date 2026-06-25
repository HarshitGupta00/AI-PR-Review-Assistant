const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = 'gemini-2.5-flash-lite';

// Full enriched response schema — every field the frontend needs
const responseSchema = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: 'A 2-4 sentence high-level summary of the PR changes and overall code quality.',
    },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Short, specific title for the issue (5-8 words max), e.g. "SQL Injection via unparameterized query"',
          },
          file: { type: 'string', description: 'Relative file path, e.g. src/services/userService.ts' },
          line: { type: 'number', description: 'Approximate line number in the diff' },
          severity: {
            type: 'string',
            enum: ['info', 'minor', 'major', 'critical'],
            description: 'critical=security/data-loss, major=bug/significant perf, minor=style/test, info=suggestion',
          },
          category: {
            type: 'string',
            enum: ['bug', 'style', 'performance', 'security', 'test-coverage'],
          },
          comment: {
            type: 'string',
            description: 'Clear, actionable explanation in 2-4 sentences. Describe WHY it is a problem.',
          },
          codeSnippet: {
            type: 'string',
            description: 'The exact problematic code from the diff (copy verbatim, 3-15 lines). Include context lines.',
          },
          suggestedFix: {
            type: 'string',
            description: 'The corrected version of the same code block showing how to fix it.',
          },
          confidence: {
            type: 'number',
            description: 'Your confidence this is a real issue, from 0 to 100.',
          },
        },
        required: ['title', 'file', 'line', 'severity', 'category', 'comment', 'codeSnippet', 'suggestedFix', 'confidence'],
      },
    },
  },
  required: ['summary', 'issues'],
};

function buildPrompt(diff, checks = {}) {
  const enabledChecks = [];
  if (checks.bugs !== false) enabledChecks.push('Bugs and logical errors');
  if (checks.security !== false) enabledChecks.push('Security vulnerabilities (SQL injection, XSS, hardcoded secrets, etc.)');
  if (checks.performance !== false) enabledChecks.push('Performance problems (N+1 queries, memory leaks, expensive loops)');
  if (checks.codeStyle !== false) enabledChecks.push('Code style and maintainability issues');
  if (checks.testCoverage) enabledChecks.push('Missing or inadequate test coverage');

  const checkList = enabledChecks.map(c => `- ${c}`).join('\n');

  return `You are a senior software engineer doing a thorough code review of a pull request.

Review ONLY for the following issue types (as requested by the developer):
${checkList}

Analyze the unified diff below and identify REAL issues. Be specific and actionable.

Rules:
- Only flag genuine problems. Do not invent issues where the code is fine.
- Reference the actual file path and approximate line number from the diff.
- For each issue, include:
  * A short descriptive title
  * The exact problematic code snippet (copy from diff, verbatim)
  * A corrected version of the code as the suggested fix
  * Your confidence score (0-100) that this is actually a problem
- Keep explanations concise (2-4 sentences), focused on WHY it is a problem.
- For security issues, explain the attack vector.
- If the diff is clean, return an empty issues array and say so in summary.

Diff:
\`\`\`diff
${diff}
\`\`\`
`;
}

/**
 * Compute an overall score (0-100) and risk level from issues.
 * Deduct points based on severity:
 *   critical: -20 each (max -60)
 *   major:    -8  each (max -30)
 *   minor:    -2  each (max -10)
 */
function computeScore(issues) {
  const criticals = issues.filter(i => i.severity === 'critical').length;
  const majors    = issues.filter(i => i.severity === 'major').length;
  const minors    = issues.filter(i => i.severity === 'minor').length;

  const deduction =
    Math.min(criticals * 20, 60) +
    Math.min(majors * 8, 30)    +
    Math.min(minors * 2, 10);

  const score = Math.max(0, 100 - deduction);

  let riskLevel;
  if (criticals >= 2 || score < 50) riskLevel = 'Critical';
  else if (criticals >= 1 || score < 70) riskLevel = 'High';
  else if (majors >= 2 || score < 85) riskLevel = 'Medium';
  else riskLevel = 'Low';

  return { score, riskLevel };
}

const MAX_DIFF_CHARS = 30000;

/**
 * @param {string} diff        - raw unified diff text
 * @param {object} [checks]    - which check categories to enable
 * @returns {{ summary, score, riskLevel, issues[] }}
 */
async function reviewDiff(diff, checks = {}) {
  const trimmedDiff =
    diff.length > MAX_DIFF_CHARS
      ? diff.slice(0, MAX_DIFF_CHARS) + '\n\n[diff truncated for length]'
      : diff;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildPrompt(trimmedDiff, checks),
    config: {
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  let parsed;
  try {
    parsed = JSON.parse(response.text);
  } catch (err) {
    throw new Error('AI response was not valid JSON: ' + err.message);
  }

  if (typeof parsed.summary !== 'string' || !Array.isArray(parsed.issues)) {
    throw new Error('AI response did not match expected schema');
  }

  const { score, riskLevel } = computeScore(parsed.issues);

  return {
    summary: parsed.summary,
    score,
    riskLevel,
    issues: parsed.issues,
  };
}

module.exports = { reviewDiff };