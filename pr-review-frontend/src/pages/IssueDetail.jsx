import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Shield, ChevronRight, Loader } from 'lucide-react';
import { getReview } from '../api/reviews';

const severityConfig = {
  critical: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Critical', badgeClass: 'badge-critical', barColor: '#ff4d6d' },
  major:    { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Major', badgeClass: 'badge-major', barColor: '#f59e0b' },
  minor:    { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Minor', badgeClass: 'badge-minor', barColor: '#38bdf8' },
  info:     { icon: AlertCircle, color: 'text-[#8892b0]', bg: 'bg-[#1e2d45]/40 border-[#1e2d45]/60', label: 'Info', badgeClass: 'badge-minor', barColor: '#8892b0' },
};

export default function IssueDetail() {
  const { reviewId, issueId } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getReview(reviewId)
      .then(review => {
        const issues = review?.result?.issues || [];
        const idx = parseInt(issueId, 10);
        const found = isNaN(idx) ? issues.find(i => i._id === issueId) : issues[idx];
        if (!found) {
          setError('Issue not found in this review.');
        } else {
          setIssue(found);
        }
      })
      .catch(() => setError('Could not load review data.'))
      .finally(() => setLoading(false));
  }, [reviewId, issueId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader size={28} className="text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#8892b0]">Loading issue...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm text-[#8892b0]">{error || 'Issue not found.'}</p>
          <button onClick={() => navigate(`/reviews/${reviewId}`)} className="mt-4 btn-secondary text-xs">
            <ArrowLeft size={13} /> Back to Review
          </button>
        </div>
      </div>
    );
  }

  const sc = severityConfig[issue.severity] || severityConfig.minor;
  const confidence = issue.confidence ?? 85;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm text-[#8892b0] mb-6"
      >
        <button onClick={() => navigate(`/reviews/${reviewId}`)} className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
          <ArrowLeft size={14} />
          Back to Review
        </button>
        <ChevronRight size={14} />
        <span className="text-[#e8eaf6] truncate max-w-xs">{issue.title || 'Issue Detail'}</span>
      </motion.div>

      {/* Issue Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`glass-card rounded-xl p-6 border ${sc.bg} mb-6`}
      >
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sc.bg}`}>
            <sc.icon size={20} className={sc.color} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={sc.badgeClass}>{sc.label} {issue.category} Issue</span>
              <span className="text-xs text-[#8892b0] font-mono">
                {issue.file}{issue.line ? `:${issue.line}` : ''}
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#e8eaf6] mb-2">{issue.title || 'Untitled Issue'}</h1>
            <p className="text-sm text-[#8892b0] leading-relaxed">{issue.comment}</p>
          </div>
          {/* Confidence bar */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-xs text-[#8892b0]">Confidence</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-[#1e2d45] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: sc.barColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                />
              </div>
              <span className={`text-sm font-bold ${sc.color}`}>{confidence}%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Code & Explanation */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Vulnerable Code */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d45]/60 bg-[#0d1117]/60">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>
            <span className="text-xs font-mono text-[#8892b0]">{issue.file}</span>
          </div>
          {issue.codeSnippet ? (
            <pre className="code-block rounded-none p-5 m-0 border-0 text-xs leading-relaxed overflow-x-auto">
              <code>{issue.codeSnippet}</code>
            </pre>
          ) : (
            <div className="p-8 text-center text-[#4a5568] text-xs font-mono">
              No code snippet available
            </div>
          )}
        </motion.div>

        {/* Right: Explanation + Fix */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-indigo-400" />
              <h3 className="text-sm font-semibold text-[#e8eaf6]">AI Explanation</h3>
            </div>
            <p className="text-sm text-[#8892b0] leading-relaxed">
              {issue.comment || 'No explanation available.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl overflow-hidden border border-emerald-500/20"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-500/20 bg-emerald-500/5">
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <span className="text-xs font-semibold text-emerald-400">Suggested Fix</span>
            </div>
            {issue.suggestedFix ? (
              <pre className="code-block rounded-none p-4 m-0 border-0 text-xs leading-relaxed overflow-x-auto bg-emerald-500/3 text-emerald-300">
                <code>{issue.suggestedFix}</code>
              </pre>
            ) : (
              <div className="p-8 text-center text-[#4a5568] text-xs font-mono">
                No suggested fix available
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
