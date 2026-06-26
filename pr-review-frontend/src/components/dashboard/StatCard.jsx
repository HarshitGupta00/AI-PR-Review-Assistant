import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatRelativeDate } from '../../utils/formatDate';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function StatCard({ stat, index, loading, lastUpdated }) {
  const Icon = stat.icon;

  // Determine trend direction for styling
  const trendUp = stat.trendDirection === 'up';
  const trendDown = stat.trendDirection === 'down';
  const hasTrend = trendUp || trendDown;

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      whileHover={{
        y: -4,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      className="stat-card group relative overflow-hidden"
      style={{ boxShadow: `0 0 30px ${stat.glow}` }}
    >
      {/* Subtle background glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${stat.glow}, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        {/* Icon + Trend Badge */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
          >
            <Icon size={18} className="text-white" />
          </motion.div>

          {hasTrend && stat.trendValue && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                trendUp
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {stat.trendValue}
            </span>
          )}
        </div>

        {/* Value */}
        <p className="text-[1.75rem] font-bold text-[#e8eaf6] mb-0.5 tracking-tight">
          {loading ? (
            <span className="inline-block w-14 h-7 shimmer rounded" />
          ) : (
            stat.value
          )}
        </p>

        {/* Label */}
        <p className="text-xs font-medium text-[#8892b0] mb-1">{stat.label}</p>

        {/* Context / Delta */}
        <p className="text-[10px] text-[#4a5568] font-medium uppercase tracking-wider">
          {stat.delta}
        </p>

        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-[9px] text-[#2a3750] mt-3 pt-2 border-t border-[#1e2d45]/30">
            Updated {formatRelativeDate(lastUpdated)}
          </p>
        )}
      </div>
    </motion.div>
  );
}
