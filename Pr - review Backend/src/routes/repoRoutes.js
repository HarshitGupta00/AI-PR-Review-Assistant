const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { getRepos, connectRepo, disconnectRepo } = require('../controllers/repoController');

const router = express.Router();

router.get('/', requireAuth, getRepos);           // GET    /api/repos
router.post('/', requireAuth, connectRepo);        // POST   /api/repos
router.delete('/:id', requireAuth, disconnectRepo); // DELETE /api/repos/:id

module.exports = router;
