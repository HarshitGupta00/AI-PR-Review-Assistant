import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, AlertCircle, Activity } from 'lucide-react';

const healthColor = (h) => {
  if (h >= 90) return { text: 'text-emerald-400', bg: 'bg-emerald-500', bar: '#10b981', glow: 'rgba(16,185,129,0.15)' };
  if (h >= 75) return { text: 'text-indigo-400', bg: 'bg-indigo-500', bar: '#6366f1', glow: 'rgba(99,102,241,0.15)' };
  if (h >= 60) return { text: 'text-amber-400', bg: 'bg-amber-500', bar: '#f59e0b', glow: 'rgba(245,158,11,0.15)' };
  if (h > 0)   return { text: 'text-red-400', bg: 'bg-red-500', bar: '#ff4d6d', glow: 'rgba(255,77,109,0.15)' };
  return { text: 'text-[#4a5568]', bg: 'bg-[#4a5568]', bar: '#4a5568', glow: 'transparent' };
};

export default function RepositoryStats({ repo, healthScore }) {
  const hasReviews = (repo.prsReviewed || 0) > 0;

  const stats = [
    { label: 'Reviews', value: repo.prsReviewed || 0, icon: TrendingUp, color: 'text-indigo-400' },
    { label: 'Issues', value: hasReviews ? (repo.totalIssues ?? 0) : '—', icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'Critical', value: hasReviews ? (repo.criticalIssues ?? 0) : '—', icon: AlertCircle, color: 'text-red-400' },
  ];

  const colors = healthColor(healthScore);

  return (
    <div className="mb-4">
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {stats.map(stat => (
          <div key={stat.label} className="bg-[#0a0e1a]/60 rounded-lg px-3 py-2.5 border border-[#1e2d45]/30">
            <div className="flex items-center gap-1.5 mb-0.5">
              <stat.icon size={11} className={stat.color} />
              <span className="text-[10px] text-[#8892b0] uppercase tracking-wider">{stat.label}</span>
            </div>
            <span className="text-sm font-bold text-[#e8eaf6]">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Health Score */}
      <div className="bg-[#0a0e1a]/40 rounded-lg px-3 py-2.5 border border-[#1e2d45]/30">
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5 text-[10px] text-[#8892b0] uppercase tracking-wider">
            <Activity size={11} className={colors.text} />
            Health Score
          </span>
          <span className={`text-sm font-bold ${colors.text}`}>
            {hasReviews ? healthScore : '—'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#1e2d45]/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: colors.bar }}
            initial={{ width: 0 }}
            animate={{ width: `${healthScore}%` }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
