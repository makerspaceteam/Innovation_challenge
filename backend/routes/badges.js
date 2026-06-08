const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const authenticate = require('../middleware/auth');

// ✅ GET /api/badges — all achievements
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('requirement_value', { ascending: true });

  if (error) return res.status(500).json({ success: false, message: error.message });

  res.json({ success: true, data });
});

// ✅ GET /api/badges/day/:dayNumber — badge for a specific day
router.get('/day/:dayNumber', async (req, res) => {
  const { dayNumber } = req.params;

  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('requirement_type', 'day')
    .eq('requirement_value', parseInt(dayNumber))
    .single();

  if (error || !data) {
    return res.json({ success: true, data: null }); // no badge for this day
  }

  res.json({ success: true, data });
});

// ✅ GET /api/badges/user/:userId — all badges earned by user
router.get('/user/:userId', authenticate, async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      user_achievement_id,
      earned_at,
      achievements (
        achievement_id,
        title,
        description,
        icon_url,
        requirement_type,
        requirement_value
      )
    `)
    .eq('user_id', parseInt(userId))
    .order('earned_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, message: error.message });

  res.json({ success: true, data });
});

// ✅ POST /api/badges/award — award badge to user when they complete a day
// Call this automatically after completeDay succeeds
router.post('/award', authenticate, async (req, res) => {
  const { user_id, day_number } = req.body;

  if (!user_id || !day_number) {
    return res.status(400).json({ success: false, message: 'user_id and day_number are required' });
  }

  // Find badge for this day
  const { data: achievement } = await supabase
    .from('achievements')
    .select('*')
    .eq('requirement_type', 'day')
    .eq('requirement_value', parseInt(day_number))
    .single();

  // No badge for this day — that's fine
  if (!achievement) {
    return res.json({ success: true, awarded: false, message: 'No badge for this day' });
  }

  // Award badge (ignore if already earned — UNIQUE constraint)
  const { data, error } = await supabase
    .from('user_achievements')
    .upsert(
      { user_id: parseInt(user_id), achievement_id: achievement.achievement_id },
      { onConflict: 'user_id,achievement_id', ignoreDuplicates: true }
    )
    .select()
    .single();

  if (error) return res.status(500).json({ success: false, message: error.message });

  res.json({
    success: true,
    awarded: true,
    message: `Badge "${achievement.title}" earned!`,
    data: { ...data, achievement }
  });
});

// ✅ GET /api/badges/user/:userId/progress — all badges with earned status
router.get('/user/:userId/progress', authenticate, async (req, res) => {
  const { userId } = req.params;

  // Get all achievements
  const { data: allAchievements, error: achError } = await supabase
    .from('achievements')
    .select('*')
    .order('requirement_value', { ascending: true });

  if (achError) return res.status(500).json({ success: false, message: achError.message });

  // Get user's earned achievements
  const { data: earned, error: earnedError } = await supabase
    .from('user_achievements')
    .select('achievement_id, earned_at')
    .eq('user_id', parseInt(userId));

  if (earnedError) return res.status(500).json({ success: false, message: earnedError.message });

  const earnedMap = new Map(earned.map(e => [e.achievement_id, e.earned_at]));

  // Merge — mark each badge as earned or locked
  const data = allAchievements.map(a => ({
    ...a,
    earned: earnedMap.has(a.achievement_id),
    earned_at: earnedMap.get(a.achievement_id) || null
  }));

  res.json({
    success: true,
    data,
    total: allAchievements.length,
    earned_count: earned.length
  });
});

module.exports = router;