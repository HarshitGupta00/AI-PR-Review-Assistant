import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Loader, Clock, AlertTriangle, Zap } from 'lucide-react';
import { getReview } from '../api/reviews';

const progressSteps = [
  { id: 'fetch', label: 'Fetching Diff' },
  { id: 'context', label: 'Building Context' },
  { id: 'review', label: 'Reviewing Files' },
  { id: 'findings', label: 'Generating Findings' },
  { id: 'saving', label: 'Saving Results' },
];


export default function ReviewProcessing() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    // Simulate step progression slowly to look like it's doing work
    const stepTimings = [1500, 4000, 8000, 15000, 25000];
    const timeouts = stepTimings.map((t, i) =>
      setTimeout(() => setStep(i + 1), t)
    );

    // Elapsed timer
    timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);

    // Polling the real backend
    const pollInterval = setInterval(async () => {
      if (!reviewId) return;
      try {
        const data = await getReview(reviewId);
        if (data.status === 'completed' || data.status === 'failed') {
          navigate(`/reviews/${reviewId}`);
        }
      } catch (err) {
        console.error('Failed to poll review status', err);
      }
    }, 3000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(timerRef.current);
      clearInterval(pollInterval);
    };
  }, [reviewId, navigate]);

  const formatTime = (s) => `${s}s`;

  const severityConfig = {
    critical: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-500' },
    major: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-500' },
    minor: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-500' },
  };

  return (
    <div className="min-h-screen p-6 lg:p-8 max-w-4xl mx-auto flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm mb-6">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
          AI Review in Progress
        </div>
        <h1 className="text-3xl font-bold text-[#e8eaf6] mb-2">Reviewing PR</h1>
        <p className="text-[#8892b0]">Sit back — our AI is analyzing your pull request</p>
      </motion.div>

      {/* Main animation area */}
      <div className="flex-1 grid lg:grid-cols-2 gap-6">
        {/* Left — Progress Timeline */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="text-sm font-semibold text-[#e8eaf6] mb-6">Progress</h2>

          <div className="space-y-4">
            {progressSteps.map((s, i) => {
              const isDone = step > i + 1;
              const isActive = step === i + 1;
              const isPending = step <= i;

              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-4"
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                    isDone ? 'bg-emerald-500/20 border border-emerald-500/40'
                    : isActive ? 'bg-indigo-500/20 border border-indigo-500/40'
                    : 'bg-[#1e2d45]/40 border border-[#1e2d45]/40'
                  }`}>
                    {isDone ? (
                      <CheckCircle size={16} className="text-emerald-400" />
                    ) : isActive ? (
                      <Loader size={16} className="text-indigo-400 animate-spin" />
                    ) : (
                      <Clock size={16} className="text-[#4a5568]" />
                    )}
                  </div>

                  {/* Label */}
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    isDone ? 'text-emerald-400' : isActive ? 'text-[#e8eaf6]' : 'text-[#4a5568]'
                  }`}>
                    {s.label}
                  </span>

                  {/* Shimmer for active */}
                  {isActive && (
                    <motion.div
                      className="ml-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="w-16 h-1.5 rounded-full shimmer" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { label: 'Elapsed', value: formatTime(elapsed) },
              { label: 'Status', value: 'Processing...' },
            ].map((m) => (
              <div key={m.label} className="bg-[#0d1117]/60 rounded-lg p-3 text-center border border-[#1e2d45]/40">
                <p className="text-xs text-[#8892b0] mb-1">{m.label}</p>
                <p className="text-sm font-mono font-bold text-[#e8eaf6]">{m.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — Live Findings Stream */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-sm font-semibold text-[#e8eaf6]">Live Findings</h2>
          </div>

          <div className="flex-1 space-y-3 overflow-hidden">
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <Zap size={32} className="text-[#1e2d45] mb-3" />
              <p className="text-sm text-[#4a5568]">Waiting for AI to generate findings...</p>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#8892b0]">Overall Progress</span>
              <span className="text-xs font-medium text-indigo-400">{Math.round((step / progressSteps.length) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#1e2d45] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                animate={{ width: `${(step / progressSteps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
