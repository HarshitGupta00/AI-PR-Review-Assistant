import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Zap, BarChart3, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatRelativeDate, getScoreRating } from '../../utils/formatDate';

export default function GreetingSection({ user, analytics, reviews, loading }) {
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  // Extract a clean display name from the username
  const displayName = useMemo(() => {
    if (!user?.username) return 'Developer';
    const cleaned = user.username.replace(/\d+$/g, '');
    // Split PascalCase/camelCase into words and take the first
    const parts = cleaned.match(/[A-Z][a-z]+/g);
    if (parts && parts.length > 0) return parts[0];
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }, [user]);

  // Compute average score across all repo health data
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

  const scoreRating = getScoreRating(avgScore);
  const lastReviewDate = reviews?.[0]?.createdAt;

  const insights = useMemo(() => {
    const items = [];
    if (analytics?.totalReviews != null) {
      items.push({
        icon: BarChart3,
        text: `${analytics.totalReviews} pull request${analytics.totalReviews !== 1 ? 's' : ''} reviewed`,
      });
    }
    if (avgScore != null) {
      items.push({
        icon: Zap,
        text: `Average score: ${avgScore}/100`,
        accent: scoreRating.color,
      });
    }
    if (lastReviewDate) {
      items.push({
        icon: Clock,
        text: `Last review ${formatRelativeDate(lastReviewDate)}`,
      });
    }
    return items;
  }, [analytics, avgScore, scoreRating, lastReviewDate]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#e8eaf6] mb-1">
          {greeting}, {loading ? '...' : displayName}{' '}
          <span className="inline-block animate-[wave_2.5s_ease-in-out_infinite]">
            👋
          </span>
        </h1>
        <p className="text-sm text-[#8892b0] mb-3">
          Welcome back to your AI Review Dashboard.
        </p>

        {/* Contextual insights */}
        {!loading && insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-x-5 gap-y-1.5"
          >
            {insights.map((item, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 text-xs ${item.accent || 'text-[#6b7a96]'}`}
              >
                <item.icon size={12} className="opacity-60" />
                {item.text}
              </span>
            ))}
          </motion.div>
        )}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/reviews/new')}
        className="btn-primary text-sm shrink-0"
      >
        <Plus size={16} />
        New Review
      </motion.button>
    </div>
  );
}
