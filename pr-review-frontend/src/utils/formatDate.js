/**
 * Reusable relative date formatting utility.
 *
 * formatRelativeDate('2026-06-26T10:00:00Z')  →  "2 hours ago"
 * formatFullDate('2026-06-26T10:00:00Z')      →  "Jun 26, 2026 at 3:30 PM"
 */

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const WEEK = 604800;
const MONTH = 2592000;
const YEAR = 31536000;

/**
 * Returns a human-friendly relative timestamp.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeDate(date) {
  if (!date) return '—';

  const now = Date.now();
  const then = new Date(date).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 0) return 'just now';
  if (diffSec < 30) return 'just now';
  if (diffSec < MINUTE) return `${diffSec}s ago`;
  if (diffSec < HOUR) {
    const m = Math.floor(diffSec / MINUTE);
    return `${m} min${m > 1 ? 's' : ''} ago`;
  }
  if (diffSec < DAY) {
    const h = Math.floor(diffSec / HOUR);
    return `${h} hour${h > 1 ? 's' : ''} ago`;
  }
  if (diffSec < DAY * 2) return 'Yesterday';
  if (diffSec < WEEK) {
    const d = Math.floor(diffSec / DAY);
    return `${d} day${d > 1 ? 's' : ''} ago`;
  }
  if (diffSec < MONTH) {
    const w = Math.floor(diffSec / WEEK);
    return `${w} week${w > 1 ? 's' : ''} ago`;
  }
  if (diffSec < YEAR) {
    const mo = Math.floor(diffSec / MONTH);
    return `${mo} month${mo > 1 ? 's' : ''} ago`;
  }
  const y = Math.floor(diffSec / YEAR);
  return `${y} year${y > 1 ? 's' : ''} ago`;
}

/**
 * Returns a formatted full date/time string.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatFullDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Returns a score rating label and color class.
 * @param {number} score 0-100
 * @returns {{ label: string, color: string }}
 */
export function getScoreRating(score) {
  if (score == null || isNaN(score)) return { label: 'N/A', color: 'text-[#4a5568]' };
  if (score >= 90) return { label: 'Excellent', color: 'text-emerald-400' };
  if (score >= 75) return { label: 'Good', color: 'text-blue-400' };
  if (score >= 60) return { label: 'Fair', color: 'text-amber-400' };
  return { label: 'Needs Work', color: 'text-red-400' };
}
