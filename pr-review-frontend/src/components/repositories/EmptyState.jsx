import { motion } from 'framer-motion';
import { GitBranch, Plus, Search, FileText } from 'lucide-react';

const presets = {
  'no-repos': {
    icon: GitBranch,
    title: 'No repositories connected yet',
    description: 'Connect your first GitHub repository to start reviewing pull requests with AI.',
    actionLabel: 'Connect Repository',
    gradient: 'from-indigo-500 to-purple-600',
  },
  'no-results': {
    icon: Search,
    title: 'No repositories match your search',
    description: 'Try adjusting your search terms or filters to find what you\'re looking for.',
    actionLabel: null,
    gradient: 'from-slate-500 to-slate-600',
  },
  'no-reviews': {
    icon: FileText,
    title: 'No reviews yet',
    description: 'Review your first Pull Request to start building your code quality insights.',
    actionLabel: 'Start a Review',
    gradient: 'from-emerald-500 to-teal-600',
  },
};

export default function EmptyState({ type = 'no-repos', onAction }) {
  const preset = presets[type] || presets['no-repos'];
  const Icon = preset.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      {/* Animated icon container */}
      <motion.div
        initial={{ y: 10 }}
        animate={{ y: -5 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        className="relative mb-6"
      >
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${preset.gradient} flex items-center justify-center shadow-lg`}
          style={{ boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)' }}
        >
          <Icon size={32} className="text-white" />
        </div>
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500/20 animate-ping" style={{ animationDuration: '2s' }} />
      </motion.div>

      <h3 className="text-lg font-semibold text-[#e8eaf6] mb-2 text-center">
        {preset.title}
      </h3>
      <p className="text-sm text-[#8892b0] text-center max-w-md mb-6 leading-relaxed">
        {preset.description}
      </p>

      {preset.actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className="btn-primary text-sm"
        >
          <Plus size={16} />
          {preset.actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
