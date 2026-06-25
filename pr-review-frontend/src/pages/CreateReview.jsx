import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { requestReview } from '../api/reviews';
import {
  Play, Bug, Shield, Gauge, Code, TestTube,
  Zap, Cpu, Brain, Hash, GitBranch
} from 'lucide-react';

const checkOptions = [
  { id: 'bugs', icon: Bug, label: 'Bugs', color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/20' },
  { id: 'security', icon: Shield, label: 'Security', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10 border-indigo-500/20' },
  { id: 'performance', icon: Gauge, label: 'Performance', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  { id: 'codeStyle', icon: Code, label: 'Code Style', color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/20' },
  { id: 'testCoverage', icon: TestTube, label: 'Test Coverage', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
];

const models = [
  { id: 'gemini-flash', label: 'Gemini Flash', icon: Zap, desc: 'Fast, cost-efficient', recommended: true },
  { id: 'gpt-5', label: 'GPT 5', icon: Brain, desc: 'Most capable' },
  { id: 'claude-sonnet', label: 'Claude Sonnet', icon: Cpu, desc: 'Balanced reasoning' },
];

const contextModes = [
  { id: 'basic', label: 'Basic', desc: 'Reviews only the diff' },
  { id: 'repo-aware', label: 'Repository Aware', desc: 'Understands full context', recommended: true },
  { id: 'deep', label: 'Deep Analysis', desc: 'Thorough multi-pass review' },
];


export default function CreateReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRepo, setSelectedRepo] = useState(location.state?.repoFullName || '');
  const [prNumber, setPrNumber] = useState('');
  const [checks, setChecks] = useState({ bugs: true, security: true, performance: true, codeStyle: true, testCoverage: false });
  const [model, setModel] = useState('gemini-flash');
  const [contextMode, setContextMode] = useState('repo-aware');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const toggleCheck = (id) => setChecks(prev => ({ ...prev, [id]: !prev[id] }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedRepo || !prNumber) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const config = { model, contextMode, checks };
      const { reviewId } = await requestReview(selectedRepo, Number(prNumber), config);
      navigate(`/reviews/processing/${reviewId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start review. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <h1 className="text-2xl font-bold text-[#e8eaf6]">New Review</h1>
        <p className="text-sm text-[#8892b0] mt-1">Configure and start an AI-powered PR review</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Repository Selector */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-5">
          <label className="block text-sm font-semibold text-[#e8eaf6] mb-3">
            <GitBranch size={14} className="inline mr-2 text-indigo-400" />
            Repository
          </label>
          <input
            type="text"
            placeholder="owner/repository (e.g. facebook/react)"
            value={selectedRepo}
            onChange={e => setSelectedRepo(e.target.value)}
            required
            className="input-field font-mono"
          />
        </motion.div>

        {/* PR Number */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-xl p-5">
          <label className="block text-sm font-semibold text-[#e8eaf6] mb-3">
            <Hash size={14} className="inline mr-2 text-indigo-400" />
            PR Number
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[#8892b0] text-sm font-mono">#</span>
            <input
              type="number"
              placeholder="127"
              value={prNumber}
              onChange={e => setPrNumber(e.target.value)}
              required
              min="1"
              className="input-field font-mono"
            />
          </div>
        </motion.div>

        {/* Review Settings (Checkboxes) */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-5">
          <p className="text-sm font-semibold text-[#e8eaf6] mb-4">Review Checks</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {checkOptions.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleCheck(opt.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                  checks[opt.id]
                    ? `${opt.bgColor} ${opt.color} border-current/30`
                    : 'border-[#1e2d45]/60 text-[#8892b0] hover:border-[#1e2d45]'
                }`}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${
                  checks[opt.id] ? 'bg-current border-current' : 'border-[#1e2d45]'
                }`}>
                  {checks[opt.id] && <span className="text-[#05060f] text-[10px] font-bold">✓</span>}
                </div>
                <opt.icon size={13} />
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Model Selection */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-xl p-5">
          <p className="text-sm font-semibold text-[#e8eaf6] mb-4">AI Model</p>
          <div className="grid grid-cols-3 gap-3">
            {models.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setModel(m.id)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  model === m.id
                    ? 'border-indigo-500/50 bg-indigo-500/10 glow-sm'
                    : 'border-[#1e2d45]/60 hover:border-[#1e2d45]'
                }`}
              >
                {m.recommended && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                    Recommended
                  </span>
                )}
                <m.icon size={20} className={model === m.id ? 'text-indigo-400' : 'text-[#8892b0]'} />
                <span className={`text-xs font-semibold ${model === m.id ? 'text-indigo-300' : 'text-[#8892b0]'}`}>{m.label}</span>
                <span className="text-[10px] text-[#4a5568]">{m.desc}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Context Mode */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-5">
          <p className="text-sm font-semibold text-[#e8eaf6] mb-4">Context Mode</p>
          <div className="grid grid-cols-3 gap-3">
            {contextModes.map(cm => (
              <button
                key={cm.id}
                type="button"
                onClick={() => setContextMode(cm.id)}
                className={`relative flex flex-col gap-1 p-4 rounded-xl border transition-all text-left ${
                  contextMode === cm.id
                    ? 'border-indigo-500/50 bg-indigo-500/10'
                    : 'border-[#1e2d45]/60 hover:border-[#1e2d45]'
                }`}
              >
                {cm.recommended && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                    Recommended
                  </span>
                )}
                <span className={`text-xs font-semibold ${contextMode === cm.id ? 'text-indigo-300' : 'text-[#e8eaf6]'}`}>{cm.label}</span>
                <span className="text-[10px] text-[#4a5568] leading-relaxed">{cm.desc}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          type="submit"
          disabled={isSubmitting || !selectedRepo || !prNumber}
          className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Starting Review...
            </>
          ) : (
            <>
              <Play size={16} />
              Start Review
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
