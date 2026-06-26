import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getAnalyticsSummary } from '../api/reviews';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from 'recharts';
import {
  Clock, TrendingUp, Loader, Shield, Bug, Gauge, Code, TestTube,
  GitBranch, Hash, Zap, Cpu, Star, Activity, CheckCircle, Brain, Sparkles, Folder
} from 'lucide-react';
import {
  groupReviewsByDay, groupReviewsByWeek, groupReviewsByMonth, groupReviewsByYear,
  groupScoresByDay, groupScoresByWeek, groupScoresByMonth, groupScoresByYear
} from '../utils/chartAggregators';

// ─── Configuration ──────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  security:      '#ff4d6d',
  performance:   '#f59e0b',
  bug:           '#6366f1',
  style:         '#38bdf8',
  'test-coverage': '#10b981',
};

const FALLBACK_COLORS = ['#818cf8', '#ff4d6d', '#f59e0b', '#38bdf8', '#10b981', '#a78bfa'];

const getScoreColor = (s) => {
  if (s >= 90) return '#10b981';
  if (s >= 75) return '#6366f1';
  if (s >= 60) return '#f59e0b';
  return '#ff4d6d';
};

const getHealthLabel = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Needs Improvement';
  return 'Poor';
};

const tooltipStyle = {
  contentStyle: {
    background: '#0d1117', border: '1px solid #1e2d45',
    borderRadius: '8px', fontSize: '12px', color: '#e8eaf6',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
  },
  labelStyle: { color: '#8892b0', fontWeight: 600, marginBottom: '4px' },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

// ─── Custom Tooltips ────────────────────────────────────────────────────────

function CustomChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-xs border border-[#1e2d45]/80 shadow-2xl">
      <p className="text-[#8892b0] font-semibold mb-1">{data.tooltipTitle}</p>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#e8eaf6] font-bold">
          {payload[0].dataKey === 'score' ? data.score : data.reviews}
        </span>
        <span className="text-[#4a5568]">
          {payload[0].dataKey === 'score' ? 'Avg Score' : 'Reviews'}
        </span>
      </div>
      <p className="text-[10px] text-[#4a5568]">{data.tooltipSubtitle}</p>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-xs border border-[#1e2d45]/80 shadow-2xl">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ background: data.fill }} />
        <span className="text-[#8892b0] font-semibold capitalize">{data.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[#e8eaf6] font-bold">{data.value}</span>
        <span className="text-[#4a5568]">issues ({data.percent}%)</span>
      </div>
    </div>
  );
}

// ─── Components ─────────────────────────────────────────────────────────────

function KPICard({ title, value, context, icon: Icon, color, delay }) {
  return (
    <motion.div custom={delay} initial="hidden" animate="visible" variants={fadeUp} className="glass-card rounded-xl p-5 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-${color}-500/20 transition-colors`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
          <Icon size={16} className={`text-${color}-400`} />
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-[#8892b0] uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-[#e8eaf6] mb-1">{value}</p>
        <p className="text-[10px] text-[#4a5568]">{context}</p>
      </div>
    </motion.div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState('Daily'); // Daily, Weekly, Monthly, Yearly

  useEffect(() => {
    getAnalyticsSummary()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  // ─── Data Memoization ───────────────────────────────────────────────────
  
  const chartData = useMemo(() => {
    const dates = data?.reviewDates || [];
    if (!dates.length) return [];
    switch (granularity) {
      case 'Daily': return groupReviewsByDay(dates);
      case 'Yearly': return groupReviewsByYear(dates);
      case 'Weekly': return groupReviewsByWeek(dates);
      case 'Monthly': default: return groupReviewsByMonth(dates);
    }
  }, [data, granularity]);

  const scoreData = useMemo(() => {
    const records = data?.scoreTrends || [];
    if (!records.length) return [];
    switch (granularity) {
      case 'Daily': return groupScoresByDay(records);
      case 'Yearly': return groupScoresByYear(records);
      case 'Weekly': return groupScoresByWeek(records);
      case 'Monthly': default: return groupScoresByMonth(records);
    }
  }, [data, granularity]);

  const issueDist = useMemo(() => {
    const raw = data?.issueDistribution || [];
    const total = raw.reduce((sum, d) => sum + d.count, 0);
    return raw.map((d) => ({
      name: d.category?.replace('-', ' ') || 'Other',
      value: d.count,
      percent: total > 0 ? Math.round((d.count / total) * 100) : 0,
      fill: CATEGORY_COLORS[d.category] || '#818cf8',
    }));
  }, [data]);

  // ─── AI Insights Generation ─────────────────────────────────────────────
  
  const insights = useMemo(() => {
    if (!data) return [];
    const list = [];
    
    // Top issue
    if (issueDist.length > 0) {
      const top = issueDist[0];
      list.push({ text: `${top.name.charAt(0).toUpperCase() + top.name.slice(1)} issues account for ${top.percent}% of all detected problems.`, icon: Bug, color: 'text-red-400' });
    }
    
    // Repo attention
    const poorRepos = data.repoHealth?.filter(r => r.score < 75);
    if (poorRepos?.length > 0) {
      list.push({ text: `Repository "${poorRepos[0].fullName}" requires attention due to a lower average review score (${poorRepos[0].score}).`, icon: Shield, color: 'text-amber-400' });
    }

    // Overall score
    if (data.averageScore >= 85) {
      list.push({ text: `Codebase health is excellent with an average review score of ${data.averageScore}.`, icon: Sparkles, color: 'text-emerald-400' });
    } else if (data.averageScore > 0) {
      list.push({ text: `Average review score is ${data.averageScore}. Focus on reducing ${issueDist[0]?.name || 'common'} issues to improve.`, icon: Activity, color: 'text-indigo-400' });
    }

    // Fast reviews
    if (data.avgReviewTimeSec > 0 && data.avgReviewTimeSec < 15) {
      list.push({ text: `AI reviews are exceptionally fast, averaging ${data.avgReviewTimeSec} seconds per PR.`, icon: Zap, color: 'text-blue-400' });
    }

    return list.slice(0, 4); // max 4 insights
  }, [data, issueDist]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center h-64">
        <div className="text-center">
          <Loader size={32} className="text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#8892b0]">Loading engineering insights...</p>
        </div>
      </div>
    );
  }

  const mostReviewed = data?.mostReviewedRepo;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
        <h1 className="text-2xl font-bold text-[#e8eaf6]">Engineering Analytics</h1>
        <p className="text-sm text-[#8892b0] mt-1">AI-driven insights into your code quality and team velocity.</p>
      </motion.div>

      {/* ─── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard title="Total Reviews" value={data?.totalReviews || 0} context="All Time" icon={Hash} color="indigo" delay={0} />
        <KPICard title="Average Score" value={data?.averageScore || 0} context="Overall Code Quality" icon={Star} color="emerald" delay={1} />
        <KPICard title="Total Issues" value={data?.totalIssues || 0} context="Found by AI" icon={Bug} color="red" delay={2} />
        <KPICard title="Repos Reviewed" value={data?.reposReviewed || 0} context="Connected Projects" icon={Folder} color="purple" delay={3} />
        <KPICard title="Avg Review Time" value={`${data?.avgReviewTimeSec || 0}s`} context="Latest Summary" icon={Clock} color="amber" delay={4} />
      </div>

      {/* ─── AI Insights ─────────────────────────────────────────────────── */}
      {insights.length > 0 && (
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="glass-card rounded-xl p-6 border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-500/5 to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={18} className="text-indigo-400" />
            <h2 className="text-sm font-bold text-[#e8eaf6]">AI Insights</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-3">
                <ins.icon size={14} className={`mt-0.5 shrink-0 ${ins.color}`} />
                <p className="text-xs text-[#e8eaf6] leading-relaxed">{ins.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Charts Row ──────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Review Trend */}
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp} className="glass-card rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-400" />
              <h2 className="text-sm font-semibold text-[#e8eaf6]">Review Volume</h2>
            </div>
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value)}
              className="select-field w-auto min-w-[100px] text-[11px] py-1 px-2 border-[#1e2d45] focus:border-indigo-500/50 hover:bg-[#0d1117]/80"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
          
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-[#4a5568] text-sm">No data yet</div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
                  <XAxis dataKey="label" stroke="#4a5568" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#4a5568" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<CustomChartTooltip />} cursor={{ stroke: '#1e2d45', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="reviews" stroke="#6366f1" strokeWidth={2} fill="url(#volGradient)" animationDuration={600} activeDot={{ r: 4, fill: '#6366f1', stroke: '#0f1623' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Score Trend */}
        <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp} className="glass-card rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={16} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-[#e8eaf6]">Average Score Trend</h2>
          </div>
          
          {scoreData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-[#4a5568] text-sm">No data yet</div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
                  <XAxis dataKey="label" stroke="#4a5568" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#4a5568" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomChartTooltip />} cursor={{ stroke: '#1e2d45', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ r: 2, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 4, fill: '#10b981', stroke: '#0f1623' }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

      </div>

      {/* ─── Insights Row ────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Issue Distribution */}
        <motion.div custom={8} initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-2 glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <PieChart size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-[#e8eaf6]">Issue Distribution</h2>
          </div>

          {issueDist.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-[#4a5568] text-sm">No data yet</div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-8 h-48">
              <div className="w-48 h-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={issueDist} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                      {issueDist.map((entry, i) => (
                        <Cell key={entry.name} fill={entry.fill || FALLBACK_COLORS[i % FALLBACK_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-3 mt-4 sm:mt-0">
                {issueDist.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.fill || FALLBACK_COLORS[i % FALLBACK_COLORS.length] }} />
                    <span className="text-xs text-[#8892b0] flex-1 capitalize">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#e8eaf6] w-6 text-right">{item.value}</span>
                      <span className="text-[10px] text-[#4a5568] w-8 text-right bg-[#1e2d45]/50 py-0.5 px-1.5 rounded-md">{item.percent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Most Reviewed Repo */}
        <motion.div custom={9} initial="hidden" animate="visible" variants={fadeUp} className="glass-card rounded-xl p-5 relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-6">
            <TrophyIcon size={16} className="text-yellow-400" />
            <h2 className="text-sm font-semibold text-[#e8eaf6]">Most Reviewed Repo</h2>
          </div>

          {mostReviewed ? (
            <div className="h-full flex flex-col justify-center pb-4">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={`https://github.com/${mostReviewed.fullName.split('/')[0]}.png`}
                  alt={mostReviewed.fullName.split('/')[0]}
                  className="w-12 h-12 rounded-xl bg-[#1e2d45] border border-[#2a3750] object-cover shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-12 h-12 rounded-xl bg-[#1e2d45] border border-[#2a3750] items-center justify-center shrink-0">
                  <GitBranch size={20} className="text-[#8892b0]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#e8eaf6] truncate" title={mostReviewed.fullName}>
                    {mostReviewed.fullName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {mostReviewed.language && (
                      <span className="text-[10px] text-[#8892b0] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        {mostReviewed.language}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0d1117]/50 rounded-lg p-3 border border-[#1e2d45]/50">
                  <p className="text-[10px] text-[#4a5568] uppercase tracking-wider mb-1">Reviews</p>
                  <p className="text-lg font-bold text-[#e8eaf6]">{mostReviewed.reviewCount}</p>
                </div>
                <div className="bg-[#0d1117]/50 rounded-lg p-3 border border-[#1e2d45]/50">
                  <p className="text-[10px] text-[#4a5568] uppercase tracking-wider mb-1">Avg Score</p>
                  <p className="text-lg font-bold" style={{ color: getScoreColor(mostReviewed.score) }}>{mostReviewed.score}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-[#4a5568] text-sm">No data yet</div>
          )}
        </motion.div>

      </div>

      {/* ─── Repository Health ───────────────────────────────────────────── */}
      <motion.div custom={10} initial="hidden" animate="visible" variants={fadeUp} className="glass-card rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[#e8eaf6] mb-4">Repository Health</h2>
        {(!data?.repoHealth || data.repoHealth.length === 0) ? (
          <p className="text-sm text-[#4a5568] text-center py-8">Complete some reviews to see health scores</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e2d45] text-[10px] uppercase tracking-wider text-[#4a5568]">
                  <th className="py-3 px-2 font-semibold">Repository</th>
                  <th className="py-3 px-2 font-semibold text-right">Reviews</th>
                  <th className="py-3 px-2 font-semibold text-right">Issues</th>
                  <th className="py-3 px-2 font-semibold w-1/3">Health Score</th>
                  <th className="py-3 px-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs text-[#8892b0]">
                {data.repoHealth.map((repo, i) => {
                  const healthColor = getScoreColor(repo.score);
                  return (
                    <motion.tr
                      key={repo.fullName}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.3 }}
                      className="border-b border-[#1e2d45]/50 hover:bg-[#1e2d45]/20 transition-colors last:border-0"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://github.com/${repo.fullName.split('/')[0]}.png`}
                            alt={repo.fullName.split('/')[0]}
                            className="w-5 h-5 rounded-md border border-[#1e2d45]/60 shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-5 h-5 rounded-md bg-[#1e2d45] border border-[#2a3750] items-center justify-center shrink-0">
                            <GitBranch size={10} className="text-[#8892b0]" />
                          </div>
                          <span className="font-mono text-[#e8eaf6] truncate">{repo.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">{repo.reviewCount}</td>
                      <td className="py-3 px-2 text-right">{repo.totalIssues || 0}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-[#1e2d45] rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: healthColor }}
                              initial={{ width: 0 }}
                              animate={{ width: `${repo.score}%` }}
                              transition={{ duration: 0.7, ease: 'easeOut' }}
                            />
                          </div>
                          <span className="font-bold w-6 text-right" style={{ color: healthColor }}>
                            {repo.score}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                          style={{ 
                            color: healthColor, 
                            borderColor: `${healthColor}40`,
                            backgroundColor: `${healthColor}15`
                          }}
                        >
                          {getHealthLabel(repo.score)}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Icon helper
function TrophyIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
  );
}
