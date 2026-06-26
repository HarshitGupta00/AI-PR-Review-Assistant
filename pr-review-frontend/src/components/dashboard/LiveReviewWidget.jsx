import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, Cpu } from 'lucide-react';

export default function LiveReviewWidget({ reviews }) {
  const activeReview = reviews?.find(
    (r) => r.status === 'processing' || r.status === 'pending'
  );

  const [progress, setProgress] = useState(0);

  // Simulate progress animation for active reviews
  useEffect(() => {
    if (!activeReview) {
      setProgress(0);
      return;
    }

    // Estimate progress based on elapsed time (assume ~30s average)
    const created = new Date(activeReview.createdAt).getTime();
    const now = Date.now();
    const elapsed = (now - created) / 1000;
    const estimated = 30; // seconds
    const initial = Math.min(Math.floor((elapsed / estimated) * 100), 92);
    setProgress(activeReview.status === 'pending' ? Math.min(initial, 15) : initial);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 3;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [activeReview]);

  return (
    <AnimatePresence>
      {activeReview && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="mb-6"
        >
          <div className="glass-card rounded-xl p-5 border-l-2 border-l-indigo-500/60 relative overflow-hidden">
            {/* Animated background pulse */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.03] to-transparent animate-pulse pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Cpu size={14} className="text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#e8eaf6]">
                      AI Review {activeReview.status === 'pending' ? 'Queued' : 'Running'}
                    </h3>
                    <Loader size={12} className="text-indigo-400 animate-spin" />
                  </div>
                  <p className="text-[11px] text-[#4a5568] font-mono">
                    {activeReview.repo?.fullName || 'Repository'} · PR #{activeReview.pullRequestNumber}
                  </p>
                </div>

                <div className="ml-auto text-right">
                  <p className="text-lg font-bold text-indigo-400 tabular-nums">
                    {Math.floor(progress)}%
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-[#1e2d45]/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
