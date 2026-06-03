const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// ─── GET all achievements ───────────────────────────────────────────
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('achievement_id', { ascending: true });

  if (error) return res.status(500).json({ success: false, message: error.message });

  res.json({ success: true, data, total: data.length });
});

// ─── GET achievement by ID ──────────────────────────────────────────
router.get('/:achievementId', async (req, res) => {
  const { achievementId } = req.params;

  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('achievement_id', achievementId)
    .single();

  if (error) return res.status(404).json({ success: false, message: 'Achievement not found' });

  res.json({ success: true, data });
});

// ─── GET user's earned achievements ────────────────────────────────
router.get('/user/:userId', async (req, res) => {
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
    .eq('user_id', userId);

  if (error) return res.status(500).json({ success: false, message: error.message });

  const userAchievements = data.map(row => ({
    ...row.achievements,
    earned_at: row.earned_at
  }));

  res.json({ success: true, data: userAchievements, total: userAchievements.length });
});

// ─── GET user achievement progress ─────────────────────────────────
router.get('/user/:userId/progress', async (req, res) => {
  const { userId } = req.params;

  // Get all achievements and user's earned ones in parallel
  const [allRes, earnedRes] = await Promise.all([
    supabase.from('achievements').select('*').order('achievement_id'),
    supabase.from('user_achievements').select('achievement_id, earned_at').eq('user_id', userId)
  ]);

  if (allRes.error) return res.status(500).json({ success: false, message: allRes.error.message });
  if (earnedRes.error) return res.status(500).json({ success: false, message: earnedRes.error.message });

  const earnedMap = new Map(earnedRes.data.map(row => [row.achievement_id, row.earned_at]));

  const progress = allRes.data.map(achievement => ({
    ...achievement,
    earned: earnedMap.has(achievement.achievement_id),
    earned_at: earnedMap.get(achievement.achievement_id) || null
  }));

  res.json({
    success: true,
    data: progress,
    total_earned: earnedRes.data.length,
    total_available: allRes.data.length
  });
});

// ─── AWARD achievement to user ──────────────────────────────────────
router.post('/award', async (req, res) => {
  const { user_id, achievement_id } = req.body;

  if (!user_id || !achievement_id) {
    return res.status(400).json({ success: false, message: 'user_id and achievement_id are required' });
  }

  // Check user exists
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('user_id, full_name')
    .eq('user_id', user_id)
    .single();

  if (userError) return res.status(404).json({ success: false, message: 'User not found' });

  // Check achievement exists
  const { data: achievement, error: achError } = await supabase
    .from('achievements')
    .select('*')
    .eq('achievement_id', achievement_id)
    .single();

  if (achError) return res.status(404).json({ success: false, message: 'Achievement not found' });

  // Insert into user_achievements
  const { data, error } = await supabase
    .from('user_achievements')
    .insert({ user_id, achievement_id })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'User already has this achievement' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }

  res.status(201).json({
    success: true,
    message: 'Achievement awarded successfully',
    data: {
      user: { user_id: user.user_id, full_name: user.full_name },
      achievement,
      earned_at: data.earned_at
    }
  });
});

// ─── CHECK eligibility based on requirement_type ────────────────────
router.post('/check-eligibility', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ success: false, message: 'user_id is required' });
  }

  // Get all achievements and user's earned ones in parallel
  const [allRes, earnedRes] = await Promise.all([
    supabase.from('achievements').select('*'),
    supabase.from('user_achievements').select('achievement_id').eq('user_id', user_id)
  ]);

  if (allRes.error) return res.status(500).json({ success: false, message: allRes.error.message });
  if (earnedRes.error) return res.status(500).json({ success: false, message: earnedRes.error.message });

  const earnedIds = earnedRes.data.map(row => row.achievement_id);
  const newAchievements = allRes.data.filter(a => !earnedIds.includes(a.achievement_id));

  res.json({
    success: true,
    data: {
      total_achievements: allRes.data.length,
      already_earned: earnedIds.length,
      not_yet_earned: newAchievements,
      next_achievement: newAchievements[0] || null
    }
  });
});

// ─── REVOKE achievement from user ──────────────────────────────────
router.delete('/revoke', async (req, res) => {
  const { user_id, achievement_id } = req.body;

  if (!user_id || !achievement_id) {
    return res.status(400).json({ success: false, message: 'user_id and achievement_id are required' });
  }

  const { error } = await supabase
    .from('user_achievements')
    .delete()
    .eq('user_id', user_id)
    .eq('achievement_id', achievement_id);

  if (error) return res.status(500).json({ success: false, message: error.message });

  res.json({ success: true, message: 'Achievement revoked successfully' });
});

module.exports = router;