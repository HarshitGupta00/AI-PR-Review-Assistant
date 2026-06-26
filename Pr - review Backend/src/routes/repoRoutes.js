const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { getRepos, connectRepo, disconnectRepo, validateRepo, searchRepos } = require('../controllers/repoController');

const router = express.Router();

router.get('/', requireAuth, getRepos);           // GET    /api/repos
router.post('/', requireAuth, connectRepo);        // POST   /api/repos
router.delete('/:id', requireAuth, disconnectRepo); // DELETE /api/repos/:id
router.get('/search', requireAuth, searchRepos);   // GET    /api/repos/search?q=keyword
router.get('/validate/:owner/:repo', requireAuth, validateRepo); // GET /api/repos/validate/:owner/:repo

module.exports = router;
