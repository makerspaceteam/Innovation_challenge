const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const authenticate = require('../middleware/auth');
const requireLecturer = require('../middleware/requireLecturer');

const STUDENT_EMAIL_RE = /^[^\s@]+@student\.cadt\.edu\.kh$/i;
const PAGE_SIZE = 1000; // Supabase/PostgREST caps a single select() response at 1000 rows

const getPhaseByDay = (day) => {
  if (day <= 5) return 'Discover';
  if (day <= 10) return 'Define';
  if (day <= 15) return 'Develop';
  return 'Deliver';
};

// Fetches every row of a table/column-set, paging past PostgREST's row cap.
const fetchAll = async (table, columns) => {
  const rows = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
};

// ✅ GET /dashboard/overview — protected
// Aggregates every student's progress/badges and groups them by theme.
router.get('/overview', authenticate, requireLecturer, async (req, res) => {
  let users, progress, achievements;
  try {
    [users, progress, achievements] = await Promise.all([
      fetchAll('users', 'user_id, full_name, user_name, email, student_id, theme, status'),
      fetchAll('user_quest_progress', 'user_id, day_number'),
      fetchAll('user_achievements', 'user_id, achievement_id')
    ]);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  const progressByUser = new Map();
  for (const row of progress) {
    if (!progressByUser.has(row.user_id)) progressByUser.set(row.user_id, []);
    progressByUser.get(row.user_id).push(row.day_number);
  }

  const badgeCountByUser = new Map();
  for (const row of achievements) {
    badgeCountByUser.set(row.user_id, (badgeCountByUser.get(row.user_id) || 0) + 1);
  }

  const students = users
    .filter(u => STUDENT_EMAIL_RE.test(u.email || ''))
    .map(u => {
      const completedDays = (progressByUser.get(u.user_id) || []).sort((a, b) => a - b);
      const currentDay = Math.min(completedDays.length > 0 ? Math.max(...completedDays) + 1 : 1, 20);
      return {
        user_id: u.user_id,
        full_name: u.full_name,
        user_name: u.user_name,
        email: u.email,
        student_id: u.student_id,
        status: u.status,
        theme: u.theme || null,
        current_day: currentDay,
        current_phase: getPhaseByDay(currentDay),
        completed_days_count: completedDays.length,
        progress_percentage: Math.round((completedDays.length / 20) * 100),
        badges_earned: badgeCountByUser.get(u.user_id) || 0
      };
    })
    .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

  const themeMap = new Map();
  for (const s of students) {
    const key = s.theme || 'Unassigned';
    if (!themeMap.has(key)) themeMap.set(key, []);
    themeMap.get(key).push(s);
  }

  const themes = Array.from(themeMap.entries())
    .map(([name, members]) => ({
      theme: name,
      student_count: members.length,
      avg_progress_percentage: Math.round(
        members.reduce((sum, m) => sum + m.progress_percentage, 0) / members.length
      ),
      students: members
    }))
    .sort((a, b) => {
      if (a.theme === 'Unassigned') return 1;
      if (b.theme === 'Unassigned') return -1;
      return a.theme.localeCompare(b.theme);
    });

  res.json({
    success: true,
    data: {
      total_students: students.length,
      total_themes: themes.filter(t => t.theme !== 'Unassigned').length,
      avg_progress_percentage: students.length
        ? Math.round(students.reduce((sum, s) => sum + s.progress_percentage, 0) / students.length)
        : 0,
      themes,
      students
    }
  });
});

module.exports = router;
