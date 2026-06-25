import api from './client';

// ── Reviews ────────────────────────────────────────────────────────────────
export function requestReview(repoFullName, pullRequestNumber, config = {}) {
  return api
    .post('/api/reviews', { repoFullName, pullRequestNumber, config })
    .then(r => r.data);
}

export function getReview(reviewId) {
  return api.get(`/api/reviews/${reviewId}`).then(r => r.data);
}

export function listReviews({ limit = 20, skip = 0 } = {}) {
  return api
    .get('/api/reviews', { params: { limit, skip } })
    .then(r => r.data);
}

// ── Repositories ───────────────────────────────────────────────────────────
export function getRepos() {
  return api.get('/api/repos').then(r => r.data);
}

export function connectRepo(fullName) {
  return api.post('/api/repos', { fullName }).then(r => r.data);
}

export function disconnectRepo(repoId) {
  return api.delete(`/api/repos/${repoId}`).then(r => r.data);
}

// ── User ──────────────────────────────────────────────────────────────────
export function getMe() {
  return api.get('/api/users/me').then(r => r.data);
}

// ── Analytics ─────────────────────────────────────────────────────────────
export function getAnalyticsSummary() {
  return api.get('/api/analytics/summary').then(r => r.data);
}