import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, GitBranch, Plus, CheckCircle, XCircle, Clock, Loader,
} from 'lucide-react';
import { formatRelativeDate, formatFullDate } from '../../utils/formatDate';
import { useState } from 'react';

const statusConfig = {
  completed: { icon: CheckCircle, label: 'Completed', badge: 'badge-success' },
  processing: { icon: Loader, label: 'Processing', badge: 'badge-minor' },
  failed: { icon: XCircle, label: 'Failed', badge: 'badge-critical' },
  pending: { icon: Clock, label: 'Pending', badge: 'badge-major' },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' },
  }),
};

function DateTooltip({ date }) {
  const [show, setShow] = useState(false);
  const full = formatFullDate(date);
  const relative = formatRelativeDate(date);

  return (
    <span
      className="relative cursor-default"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="text-sm text-[#8892b0]">{relative}</span>
      {show && full && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-md text-[10px] text-[#e8eaf6] bg-[#1a2235] border border-[#1e2d45] shadow-xl whitespace-nowrap z-50 pointer-events-none">
          {full}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#1e2d45]" />
        </span>
      )}
    </span>
  );
}

function RepoCell({ review }) {
  const repoName = review.repo?.fullName || '—';
  // Extract owner from repoName (e.g. "owner/repo" -> "owner")
  const owner = repoName !== '—' ? repoName.split('/')[0] : null;
  const avatarUrl = owner ? `https://github.com/${owner}.png` : null;

  // Branch info is not yet in the model, but we prepare the layout
  const branch = review.pullRequestTitle ? null : null; // future-ready

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-md bg-[#1e2d45]/50 flex items-center justify-center shrink-0 overflow-hidden">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={owner} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        ) : null}
        <GitBranch size={13} className={`text-[#4a5568] ${avatarUrl ? 'hidden' : 'block'}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-[#e8eaf6] truncate font-medium leading-tight">
          {repoName}
        </p>
        {branch ? (
          <p className="text-[11px] text-[#4a5568] font-mono truncate mt-0.5">
            {branch}
          </p>
        ) : (
          <p className="text-[10px] text-[#2a3750] truncate mt-0.5">
            PR #{review.pullRequestNumber}
          </p>
        )}
      </div>
    </div>
  );
}

export default function RecentReviewsTable({ reviews, loading }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.4 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2d45]/60">
        <h2 className="font-semibold text-[#e8eaf6] text-sm">Recent Reviews</h2>
        <button
          onClick={() => navigate('/history')}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight size={12} />
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center">
          <GitBranch size={32} className="text-[#1e2d45] mx-auto mb-3" />
          <p className="text-sm text-[#8892b0] mb-4">No reviews yet</p>
          <button
            onClick={() => navigate('/reviews/new')}
            className="btn-primary text-xs"
          >
            <Plus size={13} /> Start your first review
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2d45]/40">
                {['PR', 'Repository', 'Status', 'Score', 'Issues', 'Created'].map(
                  (col) => (
                    <th
                      key={col}
                      className="text-left text-[10px] font-semibold text-[#4a5568] px-6 py-3 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  )
                )}
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, i) => {
                const sc =
                  statusConfig[review.status] || statusConfig.pending;
                const StatusIcon = sc.icon;
                const score = review.result?.score;
                const issueCount = review.result?.issues?.length;

                return (
                  <motion.tr
                    key={review._id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="table-row cursor-pointer group"
                    onClick={() => navigate(`/reviews/${review._id}`)}
                  >
                    {/* PR Number */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-semibold text-indigo-400">
                        #{review.pullRequestNumber}
                      </span>
                      {review.pullRequestTitle && (
                        <p className="text-[11px] text-[#4a5568] truncate max-w-[180px] mt-0.5">
                          {review.pullRequestTitle}
                        </p>
                      )}
                    </td>

                    {/* Repository */}
                    <td className="px-6 py-4">
                      <RepoCell review={review} />
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={sc.badge}>
                        <StatusIcon
                          size={10}
                          className={
                            review.status === 'processing'
                              ? 'animate-spin'
                              : ''
                          }
                        />
                        {sc.label}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="px-6 py-4">
                      {score != null ? (
                        <span
                          className={`text-sm font-semibold tabular-nums ${
                            score >= 80
                              ? 'text-emerald-400'
                              : score >= 60
                                ? 'text-amber-400'
                                : 'text-red-400'
                          }`}
                        >
                          {score}
                        </span>
                      ) : (
                        <span className="text-sm text-[#2a3750]">—</span>
                      )}
                    </td>

                    {/* Issues */}
                    <td className="px-6 py-4 text-sm text-[#8892b0] tabular-nums">
                      {issueCount != null ? issueCount : '—'}
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4">
                      <DateTooltip date={review.createdAt} />
                    </td>

                    {/* Arrow */}
                    <td className="px-6 py-4">
                      <ArrowRight
                        size={14}
                        className="text-[#2a3750] group-hover:text-indigo-400 transition-colors"
                      />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
