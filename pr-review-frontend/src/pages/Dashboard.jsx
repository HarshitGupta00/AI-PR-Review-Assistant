import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { listReviews, getAnalyticsSummary } from '../api/reviews';
import {
  TrendingUp, AlertTriangle, AlertCircle, Clock, Zap,
} from 'lucide-react';
import { getScoreRating } from '../utils/formatDate';

import {
  GreetingSection,
  StatCard,
  LiveReviewWidget,
  ChartSection,
  RecentActivity,
  RecentReviewsTable,
} from '../components/dashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [reviewData, analyticsData] = await Promise.all([
          listReviews({ limit: 10 }),
          getAnalyticsSummary(),
        ]);
        setReviews(reviewData.reviews || []);
        setAnalytics(analyticsData);
        setLastFetched(new Date().toISOString());
      } catch {
        // keep empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute average score from repo health data
  const avgScore = useMemo(() => {
    const health = analytics?.repoHealth;
    if (!health?.length) return null;
    let totalWeight = 0;
    let totalCount = 0;
    health.forEach((r) => {
      totalWeight += (r.score || 0) * (r.reviewCount || 0);
      totalCount += r.reviewCount || 0;
    });
    return totalCount > 0 ? Math.round(totalWeight / totalCount) : null;
  }, [analytics]);

  // Compute weekly trend for reviews
  const weeklyTrend = useMemo(() => {
    const weeks = analytics?.weeklyReviews;
    if (!weeks || weeks.length < 2) return null;
    const current = weeks[weeks.length - 1]?.reviews || 0;
    const previous = weeks[weeks.length - 2]?.reviews || 0;
    if (previous === 0) return current > 0 ? { direction: 'up', value: `+${current}` } : null;
    const pct = Math.round(((current - previous) / previous) * 100);
    if (pct === 0) return null;
    return {
      direction: pct > 0 ? 'up' : 'down',
      value: `${pct > 0 ? '+' : ''}${pct}%`,
    };
  }, [analytics]);

  const scoreRating = useMemo(() => getScoreRating(avgScore), [avgScore]);

  // Stats cards configuration
  const stats = useMemo(
    () => [
      {
        label: 'Reviews Run',
        value: analytics?.totalReviews ?? '—',
        delta: weeklyTrend ? 'vs last week' : 'All Time',
        icon: TrendingUp,
        color: 'from-indigo-500 to-blue-600',
        glow: 'rgba(99,102,241,0.15)',
        trendDirection: weeklyTrend?.direction || null,
        trendValue: weeklyTrend?.value || null,
      },
      {
        label: 'Issues Found',
        value: analytics?.totalIssues ?? '—',
        delta: 'All Time',
        icon: AlertTriangle,
        color: 'from-amber-500 to-orange-600',
        glow: 'rgba(245,158,11,0.15)',
        trendDirection: null,
        trendValue: null,
      },
      {
        label: 'Critical Issues',
        value: analytics?.criticalIssues ?? '—',
        delta: 'Latest Summary',
        icon: AlertCircle,
        color: 'from-red-500 to-pink-600',
        glow: 'rgba(239,68,68,0.15)',
        trendDirection: null,
        trendValue: null,
      },
      {
        label: 'Avg Review Time',
        value: analytics ? `${analytics.avgReviewTimeSec}s` : '—',
        delta: 'Per Review',
        icon: Clock,
        color: 'from-emerald-500 to-teal-600',
        glow: 'rgba(16,185,129,0.15)',
        trendDirection: null,
        trendValue: null,
      },
      {
        label: 'Avg Review Score',
        value: avgScore != null ? avgScore : '—',
        delta: avgScore != null ? scoreRating.label : 'No Data',
        icon: Zap,
        color: 'from-purple-500 to-violet-600',
        glow: 'rgba(139,92,246,0.15)',
        trendDirection: null,
        trendValue: null,
      },
    ],
    [analytics, weeklyTrend, avgScore, scoreRating]
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Greeting */}
      <GreetingSection
        user={user}
        analytics={analytics}
        reviews={reviews}
        loading={loading}
      />

      {/* Live Review Widget (only shows when a review is active) */}
      <LiveReviewWidget reviews={reviews} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {stats.map((stat, i) => (
          <StatCard
            key={stat.label}
            stat={stat}
            index={i}
            loading={loading}
            lastUpdated={lastFetched}
          />
        ))}
      </div>

      {/* Charts Row */}
      <ChartSection analytics={analytics} />

      {/* Activity + Reviews Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity — sidebar */}
        <div className="lg:col-span-1">
          <RecentActivity reviews={reviews} />
        </div>

        {/* Recent Reviews Table — main area */}
        <div className="lg:col-span-2">
          <RecentReviewsTable reviews={reviews.slice(0, 5)} loading={loading} />
        </div>
      </div>
    </div>
  );
}