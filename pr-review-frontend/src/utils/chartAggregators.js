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
