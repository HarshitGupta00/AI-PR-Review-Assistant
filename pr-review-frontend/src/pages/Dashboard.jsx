import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listReviews, getAnalyticsSummary } from '../api/reviews';
import {
  TrendingUp, AlertTriangle, AlertCircle, GitBranch,
  Plus, ArrowRight, Clock, CheckCircle, XCircle, Loader
} from 'lucide-react';

const statusConfig = {
  completed: { icon: CheckCircle, label: 'Completed', badge: 'badge-success' },
  processing: { icon: Loader, label: 'Processing', badge: 'badge-minor' },
  failed: { icon: XCircle, label: 'Failed', badge: 'badge-critical' },
  pending: { icon: Clock, label: 'Pending', badge: 'badge-major' },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    async function load() {
      try {
        const [reviewData, analyticsData] = await Promise.all([
          listReviews({ limit: 5 }),
          getAnalyticsSummary(),
        ]);
        setReviews(reviewData.reviews || []);
        setAnalytics(analyticsData);
      } catch {
        // keep empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = [
    {
      label: 'Reviews Run',
      value: analytics?.totalReviews ?? '—',
      delta: 'all time',
      icon: TrendingUp,
      color: 'from-indigo-500 to-blue-600',
      glow: 'rgba(99,102,241,0.15)',
    },
    {
      label: 'Issues Found',
      value: analytics?.totalIssues ?? '—',
      delta: 'all time',
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-600',
      glow: 'rgba(245,158,11,0.15)',
    },
    {
      label: 'Critical Issues',
      value: analytics?.criticalIssues ?? '—',
      delta: 'all time',
      icon: AlertCircle,
      color: 'from-red-500 to-pink-600',
      glow: 'rgba(239,68,68,0.15)',
    },
    {
      label: 'Avg Review Time',
      value: analytics ? `${analytics.avgReviewTimeSec}s` : '—',
      delta: 'per review',
      icon: Clock,
      color: 'from-emerald-500 to-teal-600',
      glow: 'rgba(16,185,129,0.15)',
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-sm text-[#8892b0] mb-1">{greeting}</p>
          <h1 className="text-2xl font-bold text-[#e8eaf6]">{user?.username || 'Welcome'}</h1>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          onClick={() => navigate('/reviews/new')}
          className="btn-primary text-sm"
        >
          <Plus size={16} />
          New Review
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="stat-card"
            style={{ boxShadow: `0 0 30px ${stat.glow}` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon size={16} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#e8eaf6] mb-1">
              {loading ? <span className="inline-block w-12 h-6 shimmer rounded" /> : stat.value}
            </p>
            <p className="text-xs text-[#8892b0] mb-1">{stat.label}</p>
            <p className="text-xs text-[#4a5568]">{stat.delta}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Reviews Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2d45]/60">
          <h2 className="font-semibold text-[#e8eaf6]">Recent Reviews</h2>
          <button
            onClick={() => navigate('/history')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <GitBranch size={32} className="text-[#1e2d45] mx-auto mb-3" />
            <p className="text-sm text-[#8892b0] mb-4">No reviews yet</p>
            <button onClick={() => navigate('/reviews/new')} className="btn-primary text-xs">
              <Plus size={13} /> Start your first review
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e2d45]/40">
                  {['PR', 'Repository', 'Status', 'Issues', 'Created'].map(col => (
                    <th key={col} className="text-left text-xs font-medium text-[#8892b0] px-6 py-3 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {reviews.map((review, i) => {
                  const sc = statusConfig[review.status] || statusConfig.pending;
                  return (
                    <motion.tr
                      key={review._id}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      className="table-row cursor-pointer"
                      onClick={() => navigate(`/reviews/${review._id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-mono font-medium text-indigo-400">
                        #{review.pullRequestNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#e8eaf6]">
                        {review.repo?.fullName || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={sc.badge}>
                          <sc.icon size={10} className={review.status === 'processing' ? 'animate-spin' : ''} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#8892b0]">
                        {review.result?.issues?.length ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#8892b0]">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <ArrowRight size={14} className="text-[#4a5568]" />
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}