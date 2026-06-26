/**
 * Helper functions to aggregate raw review dates into chart data points.
 * Keeps chart transformation logic separate from UI.
 */

// Format: "June 24, 2026"
const formatFullDate = (date) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);

// Format: "Jun 24"
const formatShortDate = (date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);

// Format: "June 2026"
const formatMonthYear = (date) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);

// Format: "Jun"
const formatShortMonth = (date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);

// Get ISO week number
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Get the start and end dates of a week
const getWeekRange = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${formatFullDate(start)} – ${formatFullDate(end)}`;
};

/**
 * @param {string[]} dates - Array of ISO date strings
 */
export function groupReviewsByDay(dates) {
  if (!dates || !dates.length) return [];
  const counts = {};
  
  let minTime = Infinity;
  let maxTime = -Infinity;

  dates.forEach((d) => {
    const dateObj = new Date(d);
    dateObj.setHours(0, 0, 0, 0);
    const time = dateObj.getTime();
    if (time < minTime) minTime = time;
    if (time > maxTime) maxTime = time;
    counts[time] = (counts[time] || 0) + 1;
  });

  // Pad the range
  const data = [];
  for (let t = minTime; t <= maxTime; t += 86400000) {
    const dateObj = new Date(t);
    data.push({
      label: formatShortDate(dateObj),
      tooltipTitle: formatFullDate(dateObj),
      tooltipSubtitle: 'Reviews Completed',
      reviews: counts[t] || 0,
    });
  }
  return data;
}

export function groupReviewsByWeek(dates) {
  if (!dates || !dates.length) return [];
  const counts = {};
  
  let minTime = Infinity;
  let maxTime = -Infinity;

  dates.forEach((d) => {
    const dateObj = new Date(d);
    // Align to Monday
    const day = dateObj.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    dateObj.setDate(dateObj.getDate() + diffToMonday);
    dateObj.setHours(0, 0, 0, 0);
    
    const time = dateObj.getTime();
    if (time < minTime) minTime = time;
    if (time > maxTime) maxTime = time;
    counts[time] = (counts[time] || 0) + 1;
  });

  const data = [];
  for (let t = minTime; t <= maxTime; t += 7 * 86400000) {
    const dateObj = new Date(t);
    const week = getWeekNumber(dateObj);
    data.push({
      label: `W${week}`,
      tooltipTitle: `Week ${week}`,
      tooltipSubtitle: getWeekRange(dateObj),
      reviews: counts[t] || 0,
    });
  }
  return data;
}

export function groupReviewsByMonth(dates) {
  if (!dates || !dates.length) return [];
  const counts = {};
  
  let minDate = new Date(dates[0]);
  let maxDate = new Date(dates[0]);

  dates.forEach((d) => {
    const dateObj = new Date(d);
    if (dateObj < minDate) minDate = dateObj;
    if (dateObj > maxDate) maxDate = dateObj;
    
    const key = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  const data = [];
  const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  while (current <= end) {
    const key = `${current.getFullYear()}-${current.getMonth()}`;
    data.push({
      label: formatShortMonth(current),
      tooltipTitle: formatMonthYear(current),
      tooltipSubtitle: 'Reviews Completed',
      reviews: counts[key] || 0,
    });
    current.setMonth(current.getMonth() + 1);
  }
  return data;
}

export function groupReviewsByYear(dates) {
  if (!dates || !dates.length) return [];
  const counts = {};
  
  let minYear = Infinity;
  let maxYear = -Infinity;

  dates.forEach((d) => {
    const year = new Date(d).getFullYear();
    if (year < minYear) minYear = year;
    if (year > maxYear) maxYear = year;
    counts[year] = (counts[year] || 0) + 1;
  });

  const data = [];
  for (let y = minYear; y <= maxYear; y++) {
    data.push({
      label: y.toString(),
      tooltipTitle: y.toString(),
      tooltipSubtitle: 'Reviews Completed',
      reviews: counts[y] || 0,
    });
  }
  return data;
}

// ─── Score Aggregators ────────────────────────────────────────────────────────

function aggregateScores(records, timeKeyFn, formatLabelFn, formatTooltipFn, getNextTimeFn) {
  if (!records || !records.length) return [];
  const buckets = {};
  
  let minTime = Infinity;
  let maxTime = -Infinity;

  records.forEach(({ date, score }) => {
    const t = timeKeyFn(date);
    if (t < minTime) minTime = t;
    if (t > maxTime) maxTime = t;
    if (!buckets[t]) buckets[t] = { sum: 0, count: 0 };
    buckets[t].sum += score;
    buckets[t].count += 1;
  });

  const data = [];
  let current = minTime;
  while (current <= maxTime) {
    const bucket = buckets[current];
    data.push({
      label: formatLabelFn(current),
      tooltipTitle: formatTooltipFn(current),
      tooltipSubtitle: 'Average Score',
      score: bucket ? Math.round(bucket.sum / bucket.count) : null,
    });
    current = getNextTimeFn(current);
  }
  return data;
}

export function groupScoresByDay(records) {
  return aggregateScores(
    records,
    (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x.getTime(); },
    (t) => formatShortDate(new Date(t)),
    (t) => formatFullDate(new Date(t)),
    (t) => t + 86400000
  );
}

export function groupScoresByWeek(records) {
  return aggregateScores(
    records,
    (d) => {
      const x = new Date(d);
      const day = x.getDay();
      x.setDate(x.getDate() + (day === 0 ? -6 : 1 - day));
      x.setHours(0,0,0,0);
      return x.getTime();
    },
    (t) => `W${getWeekNumber(new Date(t))}`,
    (t) => `Week ${getWeekNumber(new Date(t))} (${getWeekRange(new Date(t))})`,
    (t) => t + 7 * 86400000
  );
}

export function groupScoresByMonth(records) {
  if (!records || !records.length) return [];
  const buckets = {};
  let minDate = new Date(records[0].date);
  let maxDate = new Date(records[0].date);

  records.forEach(({ date, score }) => {
    const d = new Date(date);
    if (d < minDate) minDate = d;
    if (d > maxDate) maxDate = d;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!buckets[key]) buckets[key] = { sum: 0, count: 0 };
    buckets[key].sum += score;
    buckets[key].count += 1;
  });

  const data = [];
  const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  while (current <= end) {
    const key = `${current.getFullYear()}-${current.getMonth()}`;
    const bucket = buckets[key];
    data.push({
      label: formatShortMonth(current),
      tooltipTitle: formatMonthYear(current),
      tooltipSubtitle: 'Average Score',
      score: bucket ? Math.round(bucket.sum / bucket.count) : null,
    });
    current.setMonth(current.getMonth() + 1);
  }
  return data;
}

export function groupScoresByYear(records) {
  return aggregateScores(
    records,
    (d) => new Date(d).getFullYear(),
    (y) => y.toString(),
    (y) => y.toString(),
    (y) => y + 1
  );
}
