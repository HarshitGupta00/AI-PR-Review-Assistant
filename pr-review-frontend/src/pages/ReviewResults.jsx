import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getReview } from '../api/reviews';
import {
  CheckCircle, AlertCircle, AlertTriangle, Info,
  ArrowLeft, ExternalLink, BarChart3, Shield, Bug, Gauge, Code
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const severityConfig = {
  critical: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', badgeClass: 'badge-critical', label: 'Critical' },
  major: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', badgeClass: 'badge-major', label: 'Major' },
  minor: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', badgeClass: 'badge-minor', label: 'Minor' },
  info: { icon: Info, color: 'text-[#8892b0]', bg: 'bg-[#1e2d45]/40 border-[#1e2d45]/60', badgeClass: 'badge-minor', label: 'Info' },
};

const scoreColor = (s) => s >= 85 ? '#10b981' : s >= 70 ? '#6366f1' : s >= 50 ? '#f59e0b' : '#ff4d6d';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' } }),
};

export default function ReviewResults() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const poll = useCallback(async () => {
    try {
      const data = await getReview(reviewId);
      setReview(data);
      return data.status;
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load this review.');
      return 'failed';
    }
  }, [reviewId]);

  useEffect(() => {
    let intervalId;
    async function tick() {
      const status = await poll();
      if (status === 'completed' || status === 'failed') clearInterval(intervalId);
    }
    tick();
    intervalId = setInterval(tick, 2000);
    return () => clearInterval(intervalId);
  }, [poll]);

  if (error) return <ErrorScreen msg={error} />;
  if (!review) return <LoadingScreen />;

  if (review.status === 'pending' || review.status === 'processing') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#8892b0] mb-1">
            {review.status === 'pending' ? 'Queued — waiting for worker...' : 'AI is reviewing the diff...'}
          </p>
          <p className="text-xs text-[#4a5568]">This page will update automatically</p>
        </div>
      </div>
    );
  }

  if (review.status === 'failed') return <ErrorScreen msg={review.errorMessage} />;

  const { summary, issues = [], score, riskLevel } = review.result || {};
  const repoName = review.repo?.fullName || review.repoFullName || '—';
  const critical = issues.filter(i => i.severity === 'critical').length;
  const major = issues.filter(i => i.severity === 'major').length;
  const minor = issues.filter(i => i.severity === 'minor').length;
  const info = issues.filter(i => i.severity === 'info').length;

  const donutData = [
    { name: 'Critical', value: critical, color: '#ff4d6d' },
    { name: 'Major', value: major, color: '#f59e0b' },
    { name: 'Minor', value: minor, color: '#38bdf8' },
    { name: 'Info', value: info, color: '#8892b0' },
  ].filter(d => d.value > 0);

  const filteredIssues = activeFilter === 'all'
    ? issues
    : issues.filter(i => i.severity === activeFilter);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
        <Link to="/history" className="p-2 rounded-lg text-[#8892b0] hover:text-[#e8eaf6] hover:bg-[#1e2d45]/40 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#e8eaf6]">PR #{review.pullRequestNumber}</h1>
            <span className="badge-success"><CheckCircle size={10} /> Completed</span>
            <span className="text-sm text-[#8892b0]">{repoName}</span>
          </div>
          <p className="text-sm text-[#8892b0] mt-1">{issues.length} findings identified</p>
        </div>
        
      </motion.div>

      {/* Score + Issue Breakdown row */}
      <div className={`grid ${issues.length > 0 ? 'lg:grid-cols-2' : 'lg:grid-cols-2'} gap-4 mb-6`}>
        {/* Score */}
        <motion.div
          custom={0} initial="hidden" animate="visible" variants={fadeUp}
          className="glass-card rounded-xl p-6 flex items-center gap-6"
        >
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#1e2d45" strokeWidth="8" />
              <motion.circle
                cx="40" cy="40" r="32" fill="none"
                stroke={scoreColor(score)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - score / 100) }}
                transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold" style={{ color: scoreColor(score) }}>{score}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-[#8892b0] mb-1">Overall Score</p>
            <p className="text-2xl font-bold text-[#e8eaf6]">{score} <span className="text-sm text-[#8892b0] font-normal">/ 100</span></p>
            <p className="text-xs mt-1">
              Risk: <span className="font-medium" style={{ color: scoreColor(score) }}>{riskLevel}</span>
            </p>
          </div>
        </motion.div>

        {/* Donut chart */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="glass-card rounded-xl p-6">
          <p className="text-xs text-[#8892b0] mb-3 font-medium">Issue Breakdown</p>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData.length > 0 ? donutData : [{ name: 'Clean', value: 1, color: '#10b981' }]} cx="50%" cy="50%" innerRadius={22} outerRadius={38} dataKey="value" paddingAngle={3}>
                    {(donutData.length > 0 ? donutData : [{ name: 'Clean', value: 1, color: '#10b981' }]).map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1e2d45', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {[{ label: 'Critical', count: critical, color: '#ff4d6d' }, { label: 'Major', count: major, color: '#f59e0b' }, { label: 'Minor', count: minor, color: '#38bdf8' }, { label: 'Info', count: info, color: '#8892b0' }].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-[#8892b0]">{item.label}:</span>
                  <span className="text-xs font-bold text-[#e8eaf6]">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Summary — full width, never truncated */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="glass-card rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <BarChart3 size={12} className="text-indigo-400" />
          </div>
          <p className="text-sm font-semibold text-[#e8eaf6]">AI Summary</p>
        </div>
        <p className="text-sm text-[#8892b0] leading-relaxed whitespace-pre-line">{summary}</p>

        {/* Clean code celebration when 0 issues */}
        {issues.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-5 flex items-center gap-3 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-400 mb-0.5">Clean Code — No Issues Found</p>
              <p className="text-xs text-[#8892b0]">The AI review found no bugs, security issues, or code quality problems in this pull request.</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Findings List */}
      <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="glass-card rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2d45]/60">
          <h2 className="font-semibold text-[#e8eaf6]">Findings</h2>
          <div className="flex gap-2">
            {['all', 'critical', 'major', 'minor', 'info'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                  activeFilter === f
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-[#8892b0] hover:text-[#e8eaf6]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#1e2d45]/40">
          {filteredIssues.map((issue, i) => {
            const sc = severityConfig[issue.severity] || severityConfig.minor;
            const confidence = issue.confidence ?? null;
            return (
              <motion.div
                key={issue._id || i}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="px-6 py-5 hover:bg-indigo-500/[0.02] transition-colors group"
              >
                {/* Header row */}
                <div className="flex items-start gap-4 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${sc.bg}`}>
                    <sc.icon size={14} className={sc.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={sc.badgeClass}>{sc.label}</span>
                      <span className="text-xs text-[#8892b0] uppercase tracking-wider">{issue.category}</span>
                      {confidence !== null && (
                        <span className="text-xs text-[#4a5568] ml-auto">{confidence}% confidence</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#e8eaf6] mb-1">{issue.title}</p>
                    <p className="text-xs font-mono text-[#8892b0]">{issue.file}{issue.line ? `:${issue.line}` : ''}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/reviews/${reviewId}/issues/${i}`)}
                    className="p-1.5 rounded-lg text-[#4a5568] hover:text-indigo-400 hover:bg-indigo-500/10 transition-all flex-shrink-0"
                    title="View full detail"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>

                {/* AI Comment */}
                {issue.comment && (
                  <p className="text-sm text-[#8892b0] leading-relaxed mb-3 ml-12">{issue.comment}</p>
                )}

                {/* Code Snippet + Suggested Fix */}
                {(issue.codeSnippet || issue.suggestedFix) && (
                  <div className="ml-12 grid lg:grid-cols-2 gap-3">
                    {issue.codeSnippet && (
                      <div className="rounded-lg overflow-hidden border border-[#1e2d45]/60">
                        <div className="flex items-center gap-2 px-3 py-2 bg-[#0d1117]/80 border-b border-[#1e2d45]/40">
                          <div className="flex gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                          </div>
                          <span className="text-[10px] font-mono text-[#4a5568] uppercase tracking-wider">Problem</span>
                        </div>
                        <pre className="p-3 bg-[#0d1117]/40 text-xs font-mono text-red-300/80 leading-relaxed overflow-x-auto max-h-48">
                          <code>{issue.codeSnippet}</code>
                        </pre>
                      </div>
                    )}
                    {issue.suggestedFix && (
                      <div className="rounded-lg overflow-hidden border border-emerald-500/20">
                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border-b border-emerald-500/20">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                          <span className="text-[10px] font-mono text-emerald-400/60 uppercase tracking-wider">Suggested Fix</span>
                        </div>
                        <pre className="p-3 bg-emerald-500/[0.02] text-xs font-mono text-emerald-300/80 leading-relaxed overflow-x-auto max-h-48">
                          <code>{issue.suggestedFix}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#8892b0]">Loading review...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ msg }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
        <p className="text-[#e8eaf6] font-medium mb-2">Review Failed</p>
        <p className="text-sm text-[#8892b0]">{msg || 'Unknown error occurred'}</p>
      </div>
    </div>
  );
}