/**
 * scheduleHelper.js
 * 
 * Change PROGRAM_START_DATE to test different weeks.
 * Must always be a Monday (the program runs Mon–Fri, 4 weeks = 20 days).
 */

const PROGRAM_START_DATE = '2026-06-01'; // ← change this to test

/**
 * Given a day number (1–20), returns the calendar date it falls on.
 * Skips Saturday and Sunday.
 * Day 1 = Monday of week 1
 * Day 5 = Friday of week 1
 * Day 6 = Monday of week 2 ... etc.
 */
function getDayDate(dayNumber) {
  const start = new Date(PROGRAM_START_DATE);
  // Make sure we start from midnight UTC to avoid timezone drift
  start.setUTCHours(0, 0, 0, 0);

  let weekdaysAdded = 0;
  let current = new Date(start);

  while (weekdaysAdded < dayNumber - 1) {
    current.setUTCDate(current.getUTCDate() + 1);
    const dow = current.getUTCDay(); // 0=Sun, 6=Sat
    if (dow !== 0 && dow !== 6) {
      weekdaysAdded++;
    }
  }

  return current; // Date object
}

/**
 * Returns a YYYY-MM-DD string for a Date object (UTC).
 */
function toDateString(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Returns today's date as YYYY-MM-DD string (UTC).
 */
function todayString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Returns true if dayNumber is unlocked (its date <= today).
 */
function isDayUnlocked(dayNumber) {
  const dayDate = toDateString(getDayDate(dayNumber));
  return todayString() >= dayDate;
}

/**
 * Builds the full schedule: array of { day, date, dateLabel, unlocked }
 * for all 20 days. Used by the quests route.
 */
function buildSchedule() {
  return Array.from({ length: 20 }, (_, i) => {
    const dayNum = i + 1;
    const date = getDayDate(dayNum);
    return {
      day: dayNum,
      date: toDateString(date),
      dateLabel: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month:   'short',
        day:     'numeric',
        timeZone: 'UTC'
      }),
      unlocked: isDayUnlocked(dayNum)
    };
  });
}

/**
 * Returns the start and end date label for a phase (e.g. "Mon Jun 2 – Fri Jun 6").
 * Used for phase header labels on the Journey page.
 */
function getPhaseSchedule(startDay, endDay) {
  const start = getDayDate(startDay);
  const end   = getDayDate(endDay);
  const fmt = (d) => d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC'
  });
  return `${fmt(start)} – ${fmt(end)}`;
}

module.exports = {
  PROGRAM_START_DATE,
  getDayDate,
  toDateString,
  todayString,
  isDayUnlocked,
  buildSchedule,
  getPhaseSchedule
};