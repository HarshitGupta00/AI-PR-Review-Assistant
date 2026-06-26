import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { listReviews, deleteReview } from '../api/reviews';
import { Calendar, Filter, CheckCircle, XCircle, Loader, Clock, ArrowRight, Search, GitBranch, Trash2, AlertTriangle } from 'lucide-react';

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-emerald-400', label: 'Completed', badge: 'badge-success' },
  processing: { icon: Loader, color: 'text-indigo-400', label: 'Processing', badge: 'badge-minor' },
  failed: { icon: XCircle, color: 'text-red-400', label: 'Failed', badge: 'badge-critical' },
  pending: { icon: Clock, color: 'text-amber-400', label: 'Pending', badge: 'badge-major' },
};

const scoreColor = (s) => {
  if (!s && s !== 0) return 'text-[#4a5568]';
  if (s >= 85) return 'text-emerald-400';
  if (s >= 70) return 'text-indigo-400';
  if (s >= 50) return 'text-amber-400';
  return 'text-red-400';
};

const dateFilters = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'All Time', days: null },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35 } }),
};

export default function ReviewHistory() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, reviewId: null, isDeleting: false });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await listReviews({ limit: 50 });
        setReviews(data.reviews || []);
        setTotal(data.total || 0);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = reviews.filter(r => {
    const repoName = r.repo?.fullName || '';
    const matchSearch =
      repoName.toLowerCase().includes(search.toLowerCase()) ||
      String(r.pullRequestNumber).includes(search.replace('#', ''));

    let matchDate = true;
    const selectedFilter = dateFilters.find(f => f.label === dateFilter);
    if (selectedFilter?.days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - selectedFilter.days);
      matchDate = new Date(r.createdAt) >= cutoff;
    }
    return matchSearch && matchDate;
  });

  const confirmDelete = async () => {
    if (!deleteModal.reviewId) return;
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
      await deleteReview(deleteModal.reviewId);
      setReviews(reviews.filter(r => r._id !== deleteModal.reviewId));
      setTotal(prev => prev - 1);
    } catch (err) {
      console.error('Failed to delete review:', err);
    } finally {
      setDeleteModal({ isOpen: false, reviewId: null, isDeleting: false });
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#e8eaf6]">Review History</h1>
          <p className="text-sm text-[#8892b0] mt-1">{total} reviews total</p>
        </div>
        <button onClick={() => navigate('/reviews/new')} className="btn-primary text-sm">
          New Review
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-lg border border-[#1e2d45]/60 bg-[#0d1117]/60">
          <Search size={15} className="text-[#8892b0]" />
          <input
            type="text"
            placeholder="Search by repo or PR..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#e8eaf6] placeholder-[#4a5568] outline-none"
          />
        </div>
        <div className="flex gap-2">
          {dateFilters.map(f => (
            <button
              key={f.label}
              onClick={() => setDateFilter(f.label)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                dateFilter === f.label
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-[#8892b0] border border-[#1e2d45]/60 hover:text-[#e8eaf6]'
              }`}
            >
              <Calendar size={12} />
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#8892b0]">Loading reviews...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e2d45]/40">
                  {['PR', 'Repository', 'Status', 'Score', 'Issues', 'Date', ''].map(col => (
                    <th key={col} className="text-left text-xs font-medium text-[#8892b0] px-6 py-3.5 uppercase tracking-wider whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((review, i) => {
                  const sc = statusConfig[review.status] || statusConfig.pending;
                  const score = review.result?.score;
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
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${scoreColor(score)}`}>
                          {score != null ? `${score}/100` : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#8892b0]">
                        {review.result?.issues?.length ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#8892b0] whitespace-nowrap">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModal({ isOpen: true, reviewId: review._id, isDeleting: false });
                            }}
                            className="p-1.5 rounded-md text-[#4a5568] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            title="Delete Review"
                          >
                            <Trash2 size={14} />
                          </button>
                          <ArrowRight size={14} className="text-[#4a5568]" />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <Filter size={32} className="text-[#1e2d45] mx-auto mb-3" />
                <p className="text-sm text-[#8892b0]">
                  {reviews.length === 0 ? 'No reviews yet' : 'No reviews match your filter'}
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f1623] border border-[#1e2d45] rounded-xl shadow-2xl max-w-sm w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-[#e8eaf6]">Delete Review</h3>
            </div>
            
            <p className="text-sm text-[#8892b0] mb-6">
              Are you sure you want to delete this PR review? This action cannot be undone and it will be permanently removed from your history and analytics.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ isOpen: false, reviewId: null, isDeleting: false })}
                disabled={deleteModal.isDeleting}
                className="px-4 py-2 text-sm font-medium text-[#e8eaf6] bg-[#1e2d45]/60 hover:bg-[#1e2d45] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteModal.isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteModal.isDeleting ? <Loader size={14} className="animate-spin" /> : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
