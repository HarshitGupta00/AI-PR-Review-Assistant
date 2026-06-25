import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAnalyticsSummary } from '../api/reviews';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Clock, TrendingUp, Loader } from 'lucide-react';

const CATEGORY_COLORS = {
  security:      '#ff4d6d',
  performance:   '#f59e0b',
  bug:           '#6366f1',
  style:         '#38bdf8',
  'test-coverage': '#10b981',
};

const scoreColor = (s) => {
  if (s >= 90) return '#10b981';
  if (s >= 75) return '#6366f1';
  if (s >= 60) return '#f59e0b';
  return '#ff4d6d';
};

const tooltipStyle = {
  contentStyle: {
    background: '#0d1117', border: '1px solid #1e2d45',
    borderRadius: '8px', fontSize: '12px', color: '#e8eaf6',
  },
  labelStyle: { color: '#8892b0' },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsSummary()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center h-64">
        <div className="text-center">
          <Loader size={32} className="text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#8892b0]">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const weeklyData = data?.weeklyReviews || [];
  const issueDist = (data?.issueDistribution || []).map(d => ({
    name: d.category,
    value: d.count,
    color: CATEGORY_COLORS[d.category] || '#8892b0',
  }));
  const repoHealth = data?.repoHealth || [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-[#e8eaf6]">Analytics</h1>
        <p className="text-sm text-[#8892b0] mt-1">Review insights and code health metrics</p>
      </motion.div>

      {/* Top stat */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}
        className="glass-card rounded-xl p-6 inline-flex items-center gap-4 mb-6 border border-indigo-500/20"
      >
        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <Clock size={20} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-xs text-[#8892b0]">Average Review Time</p>
          <p className="text-2xl font-bold text-[#e8eaf6]">
            {data?.avgReviewTimeSec ?? '—'}
            <span className="text-sm font-normal text-[#8892b0] ml-1">seconds</span>
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Review Trend */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-2 glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={16} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-[#e8eaf6]">Review Trend</h2>
            <span className="text-xs text-[#8892b0]">Reviews per week</span>
          </div>
          {weeklyData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-[#4a5568] text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
                <XAxis dataKey="week" stroke="#4a5568" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#4a5568" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                <Bar dataKey="reviews" fill="#6366f1" radius={[4, 4, 0, 0]} name="Reviews" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Issue Distribution */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[#e8eaf6] mb-6">Issue Distribution</h2>
          {issueDist.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-[#4a5568] text-sm">No data yet</div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={issueDist} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {issueDist.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {issueDist.map(item => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-xs text-[#8892b0] flex-1 capitalize">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-[#1e2d45] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: item.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(item.value * 5, 100)}%` }}
                          transition={{ delay: 0.5, duration: 0.6 }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#e8eaf6] w-6 text-right">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Repository Health */}
      <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="glass-card rounded-xl p-6 mt-6">
        <h2 className="text-sm font-semibold text-[#e8eaf6] mb-6">Repository Health</h2>
        {repoHealth.length === 0 ? (
          <p className="text-sm text-[#4a5568] text-center py-8">Complete some reviews to see health scores</p>
        ) : (
          <div className="space-y-4">
            {repoHealth.map((repo, i) => (
              <motion.div
                key={repo.fullName}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                className="flex items-center gap-4"
              >
                <span className="text-sm text-[#e8eaf6] w-44 truncate flex-shrink-0 font-mono">{repo.fullName}</span>
                <div className="flex-1 h-2 bg-[#1e2d45] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: scoreColor(repo.score) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${repo.score}%` }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-sm font-bold w-8 text-right flex-shrink-0" style={{ color: scoreColor(repo.score) }}>
                  {repo.score}
                </span>
                <span className="text-xs w-12 flex-shrink-0 text-[#8892b0]">
                  {repo.reviewCount} {repo.reviewCount === 1 ? 'review' : 'reviews'}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
