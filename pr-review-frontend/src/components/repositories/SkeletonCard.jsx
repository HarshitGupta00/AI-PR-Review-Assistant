import { motion } from 'framer-motion';

export default function SkeletonCard({ index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="glass-card rounded-xl p-5 border border-[#1e2d45]/60"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg shimmer" />
          <div>
            <div className="w-32 h-4 shimmer rounded mb-2" />
            <div className="w-20 h-3 shimmer rounded" />
          </div>
        </div>
        <div className="w-16 h-5 shimmer rounded-full" />
      </div>

      {/* Description */}
      <div className="w-full h-3 shimmer rounded mb-2" />
      <div className="w-3/4 h-3 shimmer rounded mb-4" />

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[0, 1, 2].map(j => (
          <div key={j} className="bg-[#0a0e1a]/60 rounded-lg p-3">
            <div className="w-8 h-5 shimmer rounded mb-1" />
            <div className="w-14 h-3 shimmer rounded" />
          </div>
        ))}
      </div>

      {/* Health bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <div className="w-16 h-3 shimmer rounded" />
          <div className="w-8 h-3 shimmer rounded" />
        </div>
        <div className="w-full h-2 shimmer rounded-full" />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <div className="flex-1 h-9 shimmer rounded-lg" />
        <div className="flex-1 h-9 shimmer rounded-lg" />
      </div>
    </motion.div>
  );
}
