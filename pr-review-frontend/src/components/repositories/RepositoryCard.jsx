import { motion } from 'framer-motion';
import RepositoryHeader from './RepositoryHeader';
import RepositoryStats from './RepositoryStats';
import RepositoryActions from './RepositoryActions';
import { Clock, RefreshCw } from 'lucide-react';

function timeAgo(date) {
  if (!date) return null;
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function RepositoryCard({ repo, index = 0, onDisconnect, onRefresh, isDeleting }) {
  // Use real avgScore from enriched data; fall back to 0 only when no reviews exist
  const healthScore = repo.avgScore != null ? repo.avgScore : 0;

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="glass-card rounded-xl p-5 group border border-[#1e2d45]/60 hover:border-indigo-500/30 transition-all"
    >
      {/* Header */}
      <RepositoryHeader repo={repo} />

      {/* Description */}
      {repo.description && (
        <p className="text-xs text-[#8892b0] mb-3 line-clamp-2 leading-relaxed">
          {repo.description}
        </p>
      )}

      {/* Stats & Health */}
      <RepositoryStats repo={repo} healthScore={healthScore} />

      {/* Activity timestamps */}
      <div className="flex items-center gap-4 mb-4 text-[10px] text-[#4a5568]">
        {repo.lastReview && (
          <span className="flex items-center gap-1">
            <Clock size={10} />
            Reviewed {timeAgo(repo.lastReview)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <RefreshCw size={10} />
          Synced {timeAgo(repo.updatedAt || repo.createdAt)}
        </span>
      </div>

      {/* Actions */}
      <RepositoryActions
        repo={repo}
        onDisconnect={onDisconnect}
        onRefresh={onRefresh}
        isDeleting={isDeleting}
      />
    </motion.div>
  );
}
