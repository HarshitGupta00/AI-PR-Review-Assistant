import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRepos, listReviews } from '../api/reviews';
import {
  ArrowLeft, GitBranch, Activity, TrendingUp, AlertTriangle,
  AlertCircle, BarChart3, Clock, Play, Eye, FileText,
  Lock, Globe, ChevronRight, CheckCircle, XCircle, Loader
} from 'lucide-react';
import EmptyState from '../components/repositories/EmptyState';

const langColors = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572a5',
  Java: '#b07219', Go: '#00add8', Rust: '#dea584', Ruby: '#701516',
};

const statusConfig = {
  completed: { icon: CheckCircle, label: 'Completed', badge: 'badge-success' },
  processing: { icon: Loader, label: 'Processing', badge: 'badge-minor' },
  failed: { icon: XCircle, label: 'Failed', badge: 'badge-critical' },
  pending: { icon: Clock, label: 'Pending', badge: 'badge-major' },
};

const scoreColor = (s) => {
  if (!s && s !== 0) return { text: 'text-[#4a5568]', bar: '#4a5568' };
  if (s >= 90) return { text: 'text-emerald-400', bar: '#10b981' };
  if (s >= 75) return { text: 'text-indigo-400', bar: '#6366f1' };
  if (s >= 60) return { text: 'text-amber-400', bar: '#f59e0b' };
  return { text: 'text-red-400', bar: '#ff4d6d' };
};

function timeAgo(date) {
  if (!date) return '—';
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'Just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const TABS = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'history', label: 'Review History', icon: FileText },
];

export default function RepositoryDetail() {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    async function load() {
      try {
        const [allRepos, reviewData] = await Promise.all([
          getRepos(),
          listReviews({ limit: 200 }),
        ]);
        const found = allRepos.find(r => r._id === repoId);
        if (!found) { navigate('/repositories'); return; }
        setRepo(found);

        const repoReviews = (reviewData.reviews || []).filter(
          r => (r.repo?._id || r.repo) === repoId
        );
        setReviews(repoReviews);
      } catch { navigate('/repositories'); }
      finally { setLoading(false); }
    }
    load();
  }, [repoId, navigate]);

  // Compute stats
  const stats = useMemo(() => {
    if (!reviews.length) return { reviewCount: 0, totalIssues: 0, criticalIssues: 0, avgScore: null, lastReview: null, topCategory: null };
    let totalIssues = 0, criticalIssues = 0, scores = [], categories = {};
    reviews.forEach(r => {
      const issues = r.result?.issues || [];
      totalIssues += issues.length;
      criticalIssues += issues.filter(i => i.severity === 'critical').length;
      if (r.result?.score != null) scores.push(r.result.score);
      issues.forEach(i => { categories[i.category] = (categories[i.category] || 0) + 1; });
    });
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    return {
      reviewCount: reviews.length,
      totalIssues, criticalIssues,
      avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      lastReview: reviews[0]?.createdAt,
      topCategory: topCategory ? topCategory[0] : null,
    };
  }, [reviews]);

  const healthScore = stats.avgScore ?? 0;
  const hc = scoreColor(healthScore);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-24 h-4 shimmer rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[0,1,2,3].map(i => <div key={i} className="stat-card"><div className="w-full h-16 shimmer rounded" /></div>)}
        </div>
        <div className="glass-card rounded-xl p-6"><div className="w-full h-40 shimmer rounded" /></div>
      </div>
    );
  }

  if (!repo) return null;

  const ownerName = repo.fullName?.split('/')[0] || '';
  const repoName = repo.fullName?.split('/')[1] || repo.fullName;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb & Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <button onClick={() => navigate('/repositories')} className="flex items-center gap-1.5 text-xs text-[#8892b0] hover:text-indigo-400 transition-colors mb-4">
          <ArrowLeft size={13} /> Back to Repositories
        </button>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
              <GitBranch size={22} className="text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#8892b0]">{ownerName}</span>
                <span className="text-[#4a5568]">/</span>
                <h1 className="text-xl font-bold text-[#e8eaf6]">{repoName}</h1>
                {repo.isPrivate
                  ? <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium"><Lock size={9} /> Private</span>
                  : <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium"><Globe size={9} /> Public</span>
                }
              </div>
              {repo.description && <p className="text-sm text-[#8892b0] mt-1 max-w-xl">{repo.description}</p>}
              <div className="flex items-center gap-3 mt-1">
                {repo.language && (
                  <span className="flex items-center gap-1 text-xs text-[#8892b0]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColors[repo.language] || '#8892b0' }} />
                    {repo.language}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/reviews/new', { state: { repoFullName: repo.fullName } })} className="btn-primary text-sm">
            <Play size={14} /> Review Pull Request
          </button>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Health Score', value: healthScore, icon: Activity, color: 'from-emerald-500 to-teal-600', glow: 'rgba(16,185,129,0.12)', extra: <span className={`text-2xl font-bold ${hc.text}`}>{healthScore}</span> },
          { label: 'Reviews', value: stats.reviewCount, icon: TrendingUp, color: 'from-indigo-500 to-blue-600', glow: 'rgba(99,102,241,0.12)' },
          { label: 'Avg Score', value: stats.avgScore != null ? `${stats.avgScore}/100` : '—', icon: BarChart3, color: 'from-purple-500 to-pink-600', glow: 'rgba(168,85,247,0.12)' },
          { label: 'Issues Found', value: stats.totalIssues, icon: AlertTriangle, color: 'from-amber-500 to-orange-600', glow: 'rgba(245,158,11,0.12)' },
          { label: 'Critical', value: stats.criticalIssues, icon: AlertCircle, color: 'from-red-500 to-pink-600', glow: 'rgba(239,68,68,0.12)' },
        ].map((s, i) => (
          <motion.div key={s.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}
            className="stat-card" style={{ boxShadow: `0 0 25px ${s.glow}` }}>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
              <s.icon size={15} className="text-white" />
            </div>
            {s.extra || <p className="text-2xl font-bold text-[#e8eaf6]">{s.value}</p>}
            <p className="text-xs text-[#8892b0] mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Extra info row */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="flex items-center gap-6 mb-6 text-xs text-[#8892b0]">
        {stats.topCategory && <span>Most common: <span className="text-[#e8eaf6] font-medium capitalize">{stats.topCategory}</span></span>}
        {stats.lastReview && <span>Last reviewed: <span className="text-[#e8eaf6] font-medium">{timeAgo(stats.lastReview)}</span></span>}
      </motion.div>

      {/* Health bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="glass-card rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#e8eaf6]">Repository Health</span>
          <span className={`text-sm font-bold ${hc.text}`}>{healthScore}/100</span>
        </div>
        <div className="w-full h-2.5 bg-[#1e2d45]/60 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ backgroundColor: hc.bar }}
            initial={{ width: 0 }} animate={{ width: `${healthScore}%` }}
            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }} />
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#1e2d45]/40">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px ${
              tab === t.key ? 'text-indigo-300 border-indigo-500' : 'text-[#8892b0] border-transparent hover:text-[#e8eaf6]'
            }`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && <OverviewTab reviews={reviews} repo={repo} navigate={navigate} />}
      {tab === 'history' && <HistoryTab reviews={reviews} navigate={navigate} />}
    </div>
  );
}

function OverviewTab({ reviews, repo, navigate }) {
  const recentReviews = reviews.slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Recent reviews */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2d45]/40">
          <h3 className="text-sm font-semibold text-[#e8eaf6]">Recent Reviews</h3>
          {reviews.length > 5 && (
            <button onClick={() => {}} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ChevronRight size={12} />
            </button>
          )}
        </div>
        {recentReviews.length === 0 ? (
          <EmptyState type="no-reviews" onAction={() => navigate('/reviews/new', { state: { repoFullName: repo.fullName } })} />
        ) : (
          <div className="divide-y divide-[#1e2d45]/30">
            {recentReviews.map((review, i) => {
              const sc = statusConfig[review.status] || statusConfig.pending;
              const score = review.result?.score;
              const sColor = scoreColor(score);
              return (
                <motion.div key={review._id} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  onClick={() => navigate(`/reviews/${review._id}`)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[rgba(99,102,241,0.04)] cursor-pointer transition-colors">
                  <span className="text-sm font-mono font-medium text-indigo-400 w-16">#{review.pullRequestNumber}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#e8eaf6] truncate">{review.pullRequestTitle || `PR #${review.pullRequestNumber}`}</p>
                    <p className="text-[10px] text-[#4a5568] mt-0.5">{timeAgo(review.createdAt)}</p>
                  </div>
                  <span className={sc.badge}><sc.icon size={10} className={review.status === 'processing' ? 'animate-spin' : ''} /> {sc.label}</span>
                  <span className={`text-sm font-bold w-16 text-right ${sColor.text}`}>{score != null ? score : '—'}</span>
                  <span className="text-xs text-[#8892b0] w-12 text-right">{review.result?.issues?.length ?? 0} issues</span>
                  <ChevronRight size={14} className="text-[#4a5568]" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function HistoryTab({ reviews, navigate }) {
  if (reviews.length === 0) return <EmptyState type="no-reviews" />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e2d45]/40">
              {['PR', 'Status', 'Score', 'Risk', 'Issues', 'Date', ''].map(col => (
                <th key={col} className="text-left text-xs font-medium text-[#8892b0] px-5 py-3 uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reviews.map((review, i) => {
              const sc = statusConfig[review.status] || statusConfig.pending;
              const score = review.result?.score;
              const sColor = scoreColor(score);
              return (
                <motion.tr key={review._id} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  className="table-row cursor-pointer" onClick={() => navigate(`/reviews/${review._id}`)}>
                  <td className="px-5 py-3.5 text-sm font-mono font-medium text-indigo-400">#{review.pullRequestNumber}</td>
                  <td className="px-5 py-3.5"><span className={sc.badge}><sc.icon size={10} className={review.status === 'processing' ? 'animate-spin' : ''} /> {sc.label}</span></td>
                  <td className="px-5 py-3.5"><span className={`text-sm font-bold ${sColor.text}`}>{score != null ? `${score}/100` : '—'}</span></td>
                  <td className="px-5 py-3.5"><span className="text-xs text-[#8892b0]">{review.result?.riskLevel || '—'}</span></td>
                  <td className="px-5 py-3.5 text-sm text-[#8892b0]">{review.result?.issues?.length ?? '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-[#8892b0] whitespace-nowrap">{new Date(review.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5"><ChevronRight size={14} className="text-[#4a5568]" /></td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
