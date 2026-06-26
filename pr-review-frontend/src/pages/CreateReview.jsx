import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { requestReview, validateRepo, searchRepos } from '../api/reviews';
import {
  Play, Bug, Shield, Gauge, Code, TestTube,
  Zap, Cpu, Brain, Hash, GitBranch, Info,
  Lock, CheckCircle, XCircle, Loader, Star, GitFork,
  Globe, Eye,
} from 'lucide-react';

// ─── Configuration ──────────────────────────────────────────────────────────

const checkOptions = [
  {
    id: 'bugs', icon: Bug, label: 'Bugs',
    color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/20',
    tooltip: 'Detects runtime bugs, logical mistakes, null safety issues, and incorrect implementations.',
  },
  {
    id: 'security', icon: Shield, label: 'Security',
    color: 'text-indigo-400', bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    tooltip: 'Checks for vulnerabilities, unsafe API usage, exposed secrets, authentication issues, and insecure code.',
  },
  {
    id: 'performance', icon: Gauge, label: 'Performance',
    color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20',
    tooltip: 'Detects expensive loops, unnecessary renders, memory issues, inefficient queries, and slow operations.',
  },
  {
    id: 'codeStyle', icon: Code, label: 'Code Style',
    color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/20',
    tooltip: 'Checks formatting, naming conventions, readability, maintainability, and clean code practices.',
  },
  {
    id: 'testCoverage', icon: TestTube, label: 'Test Coverage',
    color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    tooltip: 'Analyzes missing test cases, weak assertions, edge cases, and testing opportunities.',
  },
];

const models = [
  { id: 'gemini-flash', label: 'Gemini Flash', icon: Zap, desc: 'Fast, cost-efficient', recommended: true, available: true },
  { id: 'gpt-5', label: 'GPT 5', icon: Brain, desc: 'Most capable', recommended: false, available: false },
  { id: 'claude-sonnet', label: 'Claude Sonnet', icon: Cpu, desc: 'Balanced reasoning', recommended: false, available: false },
];

const contextModes = [
  { id: 'basic', label: 'Basic', desc: 'Reviews only the diff', recommended: false, available: false },
  { id: 'repo-aware', label: 'Repository Aware', desc: 'Understands full context', recommended: true, available: true },
  { id: 'deep', label: 'Deep Analysis', desc: 'Thorough multi-pass review', recommended: false, available: false },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

function CheckTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex ml-auto"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Info size={12} className="text-[#4a5568] cursor-help hover:text-[#8892b0] transition-colors" />
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 mb-2 w-56 px-3 py-2 rounded-lg text-[11px] leading-relaxed text-[#e8eaf6] bg-[#0f1623] border border-[#1e2d45] shadow-2xl z-50 pointer-events-none"
          >
            {text}
            <span className="absolute top-full right-3 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-[#1e2d45]" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function ComingSoonTooltip({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="absolute -top-14 left-1/2 -translate-x-1/2 w-56 px-3 py-2 rounded-lg text-[11px] leading-relaxed text-[#e8eaf6] bg-[#0f1623] border border-[#1e2d45] shadow-2xl z-50 text-center pointer-events-none"
        >
          Support for additional providers will be available in a future update.
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-[#1e2d45]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RepoPreviewCard({ data }) {
  if (!data) return null;

  const formatStars = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
    return n;
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="glass-card rounded-xl p-4 border-l-2 border-l-emerald-500/40">
        <div className="flex items-start gap-3">
          <img
            src={data.avatarUrl}
            alt={data.owner}
            className="w-10 h-10 rounded-lg border border-[#1e2d45]/60 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="text-sm font-semibold text-[#e8eaf6] truncate">{data.fullName}</h4>
              <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0 ${
                data.isPrivate
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              }`}>
                {data.isPrivate ? 'Private' : 'Public'}
              </span>
            </div>
            {data.description && (
              <p className="text-[11px] text-[#8892b0] leading-snug line-clamp-2 mb-2">
                {data.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#4a5568]">
              {data.language && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                  {data.language}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star size={10} /> {formatStars(data.stargazersCount)}
              </span>
              <span className="flex items-center gap-1">
                <GitFork size={10} /> {formatStars(data.forksCount)}
              </span>
              <span className="flex items-center gap-1">
                <GitBranch size={10} /> {data.defaultBranch}
              </span>
              {data.updatedAt && (
                <span>
                  Updated {new Date(data.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function CreateReview() {
  const navigate = useNavigate();
  const location = useLocation();

  // Form state
  const [selectedRepo, setSelectedRepo] = useState(location.state?.repoFullName || '');
  const [prNumber, setPrNumber] = useState('');
  const [checks, setChecks] = useState({ bugs: true, security: true, performance: true, codeStyle: true, testCoverage: false });
  const [model, setModel] = useState('gemini-flash');
  const [contextMode, setContextMode] = useState('repo-aware');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Repo validation state
  const [repoStatus, setRepoStatus] = useState(null); // null | 'loading' | 'valid' | 'not_found' | 'access_denied' | 'error'
  const [repoData, setRepoData] = useState(null);
  const debounceRef = useRef(null);

  // Auto-complete search state
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceRef = useRef(null);
  const dropdownRef = useRef(null);

  // Coming soon tooltip state
  const [comingSoonTarget, setComingSoonTarget] = useState(null);

  const toggleCheck = (id) => setChecks(prev => ({ ...prev, [id]: !prev[id] }));

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced repo validation
  const validateRepoInput = useCallback((value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    setRepoData(null);
    const trimmed = value.trim();

    if (!trimmed || !trimmed.includes('/')) {
      setRepoStatus(null);
      return;
    }

    const parts = trimmed.split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      setRepoStatus(null);
      return;
    }

    setRepoStatus('loading');
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await validateRepo(trimmed);
        setRepoData(data);
        setRepoStatus('valid');
      } catch (err) {
        const reason = err.response?.data?.reason;
        if (reason === 'not_found') setRepoStatus('not_found');
        else if (reason === 'access_denied') setRepoStatus('access_denied');
        else setRepoStatus('error');
      }
    }, 600);
  }, []);

  // Debounced search for auto-complete
  const searchForRepos = useCallback((value) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    const trimmed = value.trim();

    if (trimmed.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // Don't search if it looks like a complete owner/repo already
    if (trimmed.includes('/') && trimmed.split('/')[1]?.length > 2) {
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const data = await searchRepos(trimmed);
        setSearchResults(data.items || []);
        setShowDropdown(data.items?.length > 0);
      } catch {
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, []);

  const handleRepoChange = (value) => {
    setSelectedRepo(value);
    searchForRepos(value);
    validateRepoInput(value);
  };

  const handleSelectRepo = (fullName) => {
    setSelectedRepo(fullName);
    setShowDropdown(false);
    setSearchResults([]);
    validateRepoInput(fullName);
  };

  // Validate on mount if pre-filled from navigation
  useEffect(() => {
    if (selectedRepo && selectedRepo.includes('/')) {
      validateRepoInput(selectedRepo);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComingSoonClick = (id) => {
    setComingSoonTarget(id);
    setTimeout(() => setComingSoonTarget(null), 2000);
  };

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

  const validationMessage = (() => {
    switch (repoStatus) {
      case 'loading':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-2 text-xs text-[#8892b0]">
            <Loader size={12} className="animate-spin" /> Validating repository...
          </motion.div>
        );
      case 'valid':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-2 text-xs text-emerald-400">
            <CheckCircle size={12} /> Repository found
          </motion.div>
        );
      case 'not_found':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-2 text-xs text-red-400">
            <XCircle size={12} /> Repository not found
          </motion.div>
        );
      case 'access_denied':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-2 text-xs text-amber-400">
            <Lock size={12} /> Access denied — check your permissions
          </motion.div>
        );
      case 'error':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-2 text-xs text-red-400">
            <XCircle size={12} /> Could not validate repository
          </motion.div>
        );
      default:
        return null;
    }
  })();

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <h1 className="text-2xl font-bold text-[#e8eaf6]">New Review</h1>
        <p className="text-sm text-[#8892b0] mt-1">Configure and start an AI-powered PR review</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Repository Selector ──────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-5 relative z-10 overflow-visible">
          <label className="block text-sm font-semibold text-[#e8eaf6] mb-1">
            <GitBranch size={14} className="inline mr-2 text-indigo-400" />
            Repository
          </label>
          <p className="text-[11px] text-[#4a5568] mb-3">Search or enter a GitHub repository.</p>
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              placeholder="Search repositories... (e.g. facebook/react)"
              value={selectedRepo}
              onChange={e => handleRepoChange(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
              required
              autoComplete="off"
              className="input-field font-mono"
            />
            {/* Inline validation icon */}
            {(repoStatus === 'loading' || isSearching) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader size={14} className="animate-spin text-[#8892b0]" />
              </div>
            )}
            {repoStatus === 'valid' && !isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle size={14} className="text-emerald-400" />
              </div>
            )}
            {(repoStatus === 'not_found' || repoStatus === 'access_denied' || repoStatus === 'error') && !isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <XCircle size={14} className="text-red-400" />
              </div>
            )}

            {/* Auto-complete Dropdown */}
            <AnimatePresence>
              {showDropdown && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#0f1623] border border-[#1e2d45] rounded-xl shadow-2xl overflow-hidden max-h-[320px] overflow-y-auto"
                >
                  {searchResults.map((repo) => (
                    <button
                      key={repo.fullName}
                      type="button"
                      onClick={() => handleSelectRepo(repo.fullName)}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#1e2d45]/40 transition-colors text-left border-b border-[#1e2d45]/30 last:border-b-0"
                    >
                      <img
                        src={repo.avatarUrl}
                        alt={repo.owner}
                        className="w-8 h-8 rounded-md border border-[#1e2d45]/60 shrink-0 mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#e8eaf6] truncate">{repo.fullName}</span>
                          <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0 ${
                            repo.isPrivate
                              ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                              : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          }`}>
                            {repo.isPrivate ? 'Private' : 'Public'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#4a5568]">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-0.5">
                            <Star size={9} />
                            {repo.stargazersCount >= 1000 ? `${(repo.stargazersCount / 1000).toFixed(repo.stargazersCount >= 10000 ? 0 : 1)}k` : repo.stargazersCount}
                          </span>
                        </div>
                        {repo.description && (
                          <p className="text-[10px] text-[#4a5568] truncate mt-0.5">{repo.description}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {validationMessage}

          {/* Repository Preview Card */}
          <AnimatePresence>
            {repoData && repoStatus === 'valid' && <RepoPreviewCard data={repoData} />}
          </AnimatePresence>
        </motion.div>

        {/* ── PR Number ────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-xl p-5">
          <label className="block text-sm font-semibold text-[#e8eaf6] mb-1">
            <Hash size={14} className="inline mr-2 text-indigo-400" />
            PR Number
          </label>
          <p className="text-[11px] text-[#4a5568] mb-3">Enter the pull request number you want to review.</p>
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

        {/* ── Review Checks ────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-5">
          <p className="text-sm font-semibold text-[#e8eaf6] mb-1">Review Checks</p>
          <p className="text-[11px] text-[#4a5568] mb-4">Select the types of analysis the AI should perform.</p>
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
                <CheckTooltip text={opt.tooltip} />
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── AI Model Selection ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-xl p-5">
          <p className="text-sm font-semibold text-[#e8eaf6] mb-1">AI Model</p>
          <p className="text-[11px] text-[#4a5568] mb-4">Select the AI model to power the review.</p>
          <div className="grid grid-cols-3 gap-3">
            {models.map(m => {
              const isActive = model === m.id;
              const isLocked = !m.available;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => isLocked ? handleComingSoonClick(m.id) : setModel(m.id)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    isLocked
                      ? 'border-[#1e2d45]/40 opacity-60 cursor-default'
                      : isActive
                        ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.12)]'
                        : 'border-[#1e2d45]/60 hover:border-[#1e2d45]'
                  }`}
                >
                  {/* Badges */}
                  {m.recommended && m.available && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                      Recommended
                    </span>
                  )}
                  {isLocked && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-[#1e2d45] text-[#8892b0] px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1">
                      <Lock size={8} /> Coming Soon
                    </span>
                  )}

                  {/* Coming Soon tooltip */}
                  <ComingSoonTooltip show={comingSoonTarget === m.id} />

                  <m.icon size={20} className={isLocked ? 'text-[#4a5568]' : isActive ? 'text-indigo-400' : 'text-[#8892b0]'} />
                  <span className={`text-xs font-semibold ${isLocked ? 'text-[#4a5568]' : isActive ? 'text-indigo-300' : 'text-[#8892b0]'}`}>{m.label}</span>
                  <span className="text-[10px] text-[#4a5568]">{m.desc}</span>

                  {/* Active checkmark */}
                  {isActive && m.available && (
                    <span className="absolute top-2 right-2">
                      <CheckCircle size={12} className="text-indigo-400" />
                    </span>
                  )}
                  {isLocked && (
                    <span className="absolute top-2 right-2">
                      <Lock size={10} className="text-[#2a3750]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Context Mode ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-5">
          <p className="text-sm font-semibold text-[#e8eaf6] mb-1">Context Mode</p>
          <p className="text-[11px] text-[#4a5568] mb-4">Choose how deeply the AI analyzes your code.</p>
          <div className="grid grid-cols-3 gap-3">
            {contextModes.map(cm => {
              const isActive = contextMode === cm.id;
              const isLocked = !cm.available;

              return (
                <button
                  key={cm.id}
                  type="button"
                  onClick={() => isLocked ? handleComingSoonClick(cm.id) : setContextMode(cm.id)}
                  className={`relative flex flex-col gap-1 p-4 rounded-xl border transition-all text-left ${
                    isLocked
                      ? 'border-[#1e2d45]/40 opacity-60 cursor-default'
                      : isActive
                        ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.12)]'
                        : 'border-[#1e2d45]/60 hover:border-[#1e2d45]'
                  }`}
                >
                  {cm.recommended && cm.available && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                      Recommended
                    </span>
                  )}
                  {isLocked && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-[#1e2d45] text-[#8892b0] px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1">
                      <Lock size={8} /> Coming Soon
                    </span>
                  )}

                  {/* Coming Soon tooltip */}
                  <ComingSoonTooltip show={comingSoonTarget === cm.id} />

                  <span className={`text-xs font-semibold ${isLocked ? 'text-[#4a5568]' : isActive ? 'text-indigo-300' : 'text-[#e8eaf6]'}`}>{cm.label}</span>
                  <span className="text-[10px] text-[#4a5568] leading-relaxed">{cm.desc}</span>

                  {isActive && cm.available && (
                    <span className="absolute top-2 right-2">
                      <CheckCircle size={12} className="text-indigo-400" />
                    </span>
                  )}
                  {isLocked && (
                    <span className="absolute top-2 right-2">
                      <Lock size={10} className="text-[#2a3750]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Error ────────────────────────────────────────────────────── */}
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ── Submit ───────────────────────────────────────────────────── */}
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
