import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getRepos, connectRepo, disconnectRepo, listReviews } from '../api/reviews';
import { Plus, Search, Loader, SlidersHorizontal, RefreshCw } from 'lucide-react';
import RepositoryCard from '../components/repositories/RepositoryCard';
import SkeletonCard from '../components/repositories/SkeletonCard';
import EmptyState from '../components/repositories/EmptyState';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'recent', label: 'Recently Reviewed' },
  { key: 'needs-review', label: 'Needs Review' },
  { key: 'high-risk', label: 'High Risk' },
  { key: 'public', label: 'Public' },
  { key: 'private', label: 'Private' },
];

export default function Repositories() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showConnect, setShowConnect] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load repos and review stats
  async function load(showSpinner = true) {
    try {
      if (showSpinner) setLoading(true);
      else setRefreshing(true);

      const [repoData, reviewData] = await Promise.all([
        getRepos(),
        listReviews({ limit: 200 }).catch(() => ({ reviews: [] })),
      ]);

      // Build per-repo review stats
      const statsMap = {};
      (reviewData.reviews || []).forEach(review => {
        const repoId = String(review.repo?._id || review.repo || '');
        if (!repoId) return;
        if (!statsMap[repoId]) {
          statsMap[repoId] = { totalIssues: 0, criticalIssues: 0, reviewCount: 0, scores: [], lastReview: null };
        }
        const s = statsMap[repoId];
        s.reviewCount++;
        const issues = review.result?.issues || [];
        s.totalIssues += issues.length;
        s.criticalIssues += issues.filter(i => i.severity === 'critical').length;
        if (review.result?.score != null) s.scores.push(review.result.score);
        const reviewDate = new Date(review.createdAt);
        if (!s.lastReview || reviewDate > new Date(s.lastReview)) {
          s.lastReview = review.createdAt;
        }
      });


      // Enrich repos with review stats
      const enriched = repoData.map(repo => {
        const stats = statsMap[String(repo._id)] || {};
        const avgScore = stats.scores && stats.scores.length > 0
          ? Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length)
          : null;
        return {
          ...repo,
          prsReviewed: stats.reviewCount || repo.prsReviewed || 0,
          totalIssues: stats.totalIssues ?? 0,
          criticalIssues: stats.criticalIssues ?? 0,
          avgScore,
          lastReview: stats.lastReview || repo.lastReview,
        };
      });

      setRepos(enriched);
    } catch {
      setRepos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDisconnect(repoId) {
    if (!confirm('Disconnect this repository? Reviews will be kept.')) return;
    setDeletingId(repoId);
    try {
      await disconnectRepo(repoId);
      setRepos(prev => prev.filter(r => r._id !== repoId));
    } finally {
      setDeletingId(null);
    }
  }

  // Filter & Search
  const filtered = useMemo(() => {
    return repos.filter(r => {
      // Search: name, owner, language, description
      const q = search.toLowerCase();
      const matchSearch = !q ||
        r.fullName.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.language || '').toLowerCase().includes(q);

      // Filters
      switch (filter) {
        case 'private':
          return matchSearch && r.isPrivate;
        case 'public':
          return matchSearch && !r.isPrivate;
        case 'recent': {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return matchSearch && r.lastReview && new Date(r.lastReview) >= weekAgo;
        }
        case 'needs-review': {
          const twoWeeksAgo = new Date();
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          return matchSearch && (!r.lastReview || new Date(r.lastReview) < twoWeeksAgo);
        }
        case 'high-risk': {
          return matchSearch && r.avgScore != null && r.avgScore < 75;
        }
        default:
          return matchSearch;
      }
    });
  }, [repos, search, filter]);

  // Summary counts
  const publicCount = repos.filter(r => !r.isPrivate).length;
  const privateCount = repos.filter(r => r.isPrivate).length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-[#e8eaf6]">Repositories</h1>
            {refreshing && <RefreshCw size={14} className="text-indigo-400 animate-spin" />}
          </div>
          <p className="text-sm text-[#8892b0]">
            {repos.length} connected
            {repos.length > 0 && (
              <span className="text-[#4a5568]">
                {' · '}{publicCount} public · {privateCount} private
              </span>
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <button
            onClick={() => load(false)}
            className="p-2.5 rounded-lg text-[#8892b0] hover:text-[#e8eaf6] hover:bg-[#1e2d45]/40 border border-[#1e2d45]/60 transition-all"
            title="Refresh all"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowConnect(true)}
            className="btn-primary text-sm"
          >
            <Plus size={16} />
            Connect Repository
          </button>
        </motion.div>
      </div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mb-6 space-y-3"
      >
        {/* Search bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#1e2d45]/60 bg-[#0d1117]/60 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all">
          <Search size={15} className="text-[#8892b0] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, owner, language, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#e8eaf6] placeholder-[#4a5568] outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[#4a5568] hover:text-[#8892b0] transition-colors text-xs">
              Clear
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={13} className="text-[#4a5568] mr-1" />
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.key
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-[#8892b0] border border-[#1e2d45]/60 hover:text-[#e8eaf6] hover:border-[#1e2d45]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <SkeletonCard key={i} index={i} />
          ))}
        </div>
      )}

      {/* Repository Cards */}
      {!loading && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((repo, i) => (
            <RepositoryCard
              key={repo._id}
              repo={repo}
              index={i}
              onDisconnect={() => handleDisconnect(repo._id)}
              onRefresh={() => load(false)}
              isDeleting={deletingId === repo._id}
            />
          ))}
        </div>
      )}

      {/* Empty states */}
      {!loading && filtered.length === 0 && (
        <EmptyState
          type={repos.length === 0 ? 'no-repos' : 'no-results'}
          onAction={repos.length === 0 ? () => setShowConnect(true) : undefined}
        />
      )}

      {/* Connect modal */}
      {showConnect && (
        <ConnectModal
          onClose={() => setShowConnect(false)}
          onConnected={(repo) => { setRepos(prev => [repo, ...prev]); setShowConnect(false); }}
        />
      )}
    </div>
  );
}

function ConnectModal({ onClose, onConnected }) {
  const [repoName, setRepoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!repoName.includes('/')) {
      setError('Format must be owner/repository');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const repo = await connectRepo(repoName.trim());
      onConnected(repo);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect repository');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card rounded-2xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-[#e8eaf6] mb-2">Connect Repository</h2>
        <p className="text-sm text-[#8892b0] mb-4">Enter the GitHub repository in <code className="text-indigo-400">owner/repo</code> format.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="e.g. facebook/react"
            value={repoName}
            onChange={e => setRepoName(e.target.value)}
            className="input-field mb-3"
            autoFocus
          />
          {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
            <button type="submit" disabled={loading || !repoName} className="btn-primary flex-1 justify-center text-sm disabled:opacity-50">
              {loading ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
