import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle, AlertTriangle, GitBranch, Loader, XCircle, Zap,
} from 'lucide-react';
import { formatRelativeDate } from '../../utils/formatDate';

const ACTIVITY_CONFIG = {
  completed: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    getTitle: (r) => `Review completed for PR #${r.pullRequestNumber}`,
  },
  processing: {
    icon: Loader,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    getTitle: (r) => `Reviewing PR #${r.pullRequestNumber}`,
  },
  failed: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    getTitle: (r) => `Review failed for PR #${r.pullRequestNumber}`,
  },
  pending: {
    icon: Loader,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    getTitle: (r) => `Review queued for PR #${r.pullRequestNumber}`,
  },
};

export default function RecentActivity({ reviews }) {
  const activities = useMemo(() => {
    if (!reviews?.length) return [];

    return reviews.slice(0, 6).flatMap((review) => {
      const items = [];
      const cfg = ACTIVITY_CONFIG[review.status] || ACTIVITY_CONFIG.pending;

      // Primary activity: the review itself
      items.push({
        id: `${review._id}-status`,
        icon: cfg.icon,
        color: cfg.color,
        bg: cfg.bg,
        border: cfg.border,
        title: cfg.getTitle(review),
        repo: review.repo?.fullName,
        time: review.updatedAt || review.createdAt,
        spin: review.status === 'processing',
      });

      // Secondary: issues found (only for completed reviews)
      const issueCount = review.result?.issues?.length;
      if (review.status === 'completed' && issueCount > 0) {
        items.push({
          id: `${review._id}-issues`,
          icon: AlertTriangle,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          title: `Found ${issueCount} issue${issueCount > 1 ? 's' : ''} in PR #${review.pullRequestNumber}`,
          repo: review.repo?.fullName,
          time: review.updatedAt || review.createdAt,
        });
      }

      // Secondary: score available
      if (review.status === 'completed' && review.result?.score != null) {
        items.push({
          id: `${review._id}-score`,
          icon: Zap,
          color: review.result.score >= 80 ? 'text-emerald-400' : 'text-amber-400',
          bg: review.result.score >= 80 ? 'bg-emerald-500/10' : 'bg-amber-500/10',
          border: review.result.score >= 80 ? 'border-emerald-500/20' : 'border-amber-500/20',
          title: `Score: ${review.result.score}/100 for PR #${review.pullRequestNumber}`,
          repo: review.repo?.fullName,
          time: review.updatedAt || review.createdAt,
        });
      }

      return items;
    })
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8);
  }, [reviews]);

  if (!activities.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-[#1e2d45]/60">
        <h2 className="font-semibold text-[#e8eaf6] text-sm flex items-center gap-2">
          <GitBranch size={14} className="text-indigo-400" />
          Recent Activity
        </h2>
      </div>

      <div className="divide-y divide-[#1e2d45]/30">
        {activities.map((activity, i) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
              className="flex items-start gap-3 px-5 py-3 hover:bg-[#0d1117]/40 transition-colors"
            >
              <div
                className={`w-7 h-7 rounded-lg ${activity.bg} border ${activity.border} flex items-center justify-center shrink-0 mt-0.5`}
              >
                <Icon
                  size={13}
                  className={`${activity.color} ${activity.spin ? 'animate-spin' : ''}`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-[#e8eaf6] leading-snug truncate">
                  {activity.title}
                </p>
                {activity.repo && (
                  <p className="text-[11px] text-[#4a5568] font-mono truncate mt-0.5">
                    {activity.repo}
                  </p>
                )}
              </div>
              <span className="text-[10px] text-[#4a5568] whitespace-nowrap shrink-0 mt-0.5">
                {formatRelativeDate(activity.time)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
