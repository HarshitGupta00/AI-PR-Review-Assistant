import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell,
} from 'recharts';
import {
  groupReviewsByDay,
  groupReviewsByWeek,
  groupReviewsByMonth,
  groupReviewsByYear,
} from '../../utils/chartAggregators';

// Severity colors aligned with the design system
const SEVERITY_COLORS = {
  bug: '#ff4d6d',
  security: '#f59e0b',
  performance: '#38bdf8',
  style: '#818cf8',
  'test-coverage': '#10b981',
};

const FALLBACK_COLORS = ['#818cf8', '#ff4d6d', '#f59e0b', '#38bdf8', '#10b981', '#a78bfa'];

// Custom tooltip that matches the dark theme
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-xs border border-[#1e2d45]/80 shadow-2xl">
      <p className="text-[#8892b0] font-semibold mb-1">{data.tooltipTitle}</p>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#e8eaf6] font-bold">{data.reviews}</span>
        <span className="text-[#4a5568]">Reviews</span>
      </div>
      <p className="text-[10px] text-[#4a5568]">{data.tooltipSubtitle}</p>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-xs border border-[#1e2d45]/80 shadow-2xl">
      <p className="text-[#e8eaf6] font-semibold">
        {payload[0].name}: {payload[0].value}
      </p>
    </div>
  );
}

export default function ChartSection({ analytics }) {
  const [granularity, setGranularity] = useState('Weekly');

  const chartData = useMemo(() => {
    const dates = analytics?.reviewDates || [];
    if (!dates.length) return [];

    switch (granularity) {
      case 'Daily': return groupReviewsByDay(dates);
      case 'Monthly': return groupReviewsByMonth(dates);
      case 'Yearly': return groupReviewsByYear(dates);
      case 'Weekly':
      default:
        return groupReviewsByWeek(dates);
    }
  }, [analytics, granularity]);

  const issueData = useMemo(() => {
    if (!analytics?.issueDistribution?.length) return [];
    return analytics.issueDistribution.map((d) => ({
      name: d.category?.replace('-', ' ') || 'Other',
      value: d.count,
      fill: SEVERITY_COLORS[d.category] || '#818cf8',
    }));
  }, [analytics]);

  const hasChartData = chartData.length > 0;
  const hasIssueData = issueData.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6"
    >
      {/* Reviews Over Time — Area Chart */}
      <div className="glass-card rounded-xl p-5 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-[#e8eaf6]">Reviews Over Time</h3>
          </div>
          
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            className="select-field w-auto min-w-[100px] text-xs py-1 px-2 border-[#1e2d45] focus:border-indigo-500/50 hover:bg-[#0d1117]/80"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>

        {hasChartData ? (
          <div className="h-48 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reviewGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4a5568', fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4a5568', fontSize: 10 }}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#1e2d45', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area
                  type="monotone"
                  dataKey="reviews"
                  name="Reviews"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fill="url(#reviewGradient)"
                  animationDuration={600}
                  animationEasing="ease-in-out"
                  dot={{ r: 3, fill: '#818cf8', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#818cf8', stroke: '#0f1623', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex-1 flex items-center justify-center">
            <p className="text-sm text-[#4a5568] text-center">
              No reviews found for this time period.
            </p>
          </div>
        )}
      </div>

      {/* Issue Distribution — Pie Chart */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <PieChart size={14} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-[#e8eaf6]">Issue Distribution</h3>
          <span className="text-[10px] text-[#4a5568] ml-auto uppercase tracking-wider">
            All Time
          </span>
        </div>

        {hasIssueData ? (
          <div className="flex items-center gap-4">
            <div className="w-40 h-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={issueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {issueData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={entry.fill || FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2">
              {issueData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        entry.fill || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
                    }}
                  />
                  <span className="text-xs text-[#8892b0] capitalize flex-1 truncate">
                    {entry.name}
                  </span>
                  <span className="text-xs font-semibold text-[#e8eaf6]">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center">
            <p className="text-[11px] text-[#4a5568] text-center">
              Issue categories will appear here after completing reviews.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
