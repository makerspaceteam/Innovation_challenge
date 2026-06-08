const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// Phase ranges helper
const phaseRanges = {
  'Discover': [1, 5],
  'Define':   [6, 10],
  'Develop':  [11, 15],
  'Deliver':  [16, 20]
};

const getPhaseByDay = (day) => {
  if (day <= 5)  return 'Discover';
  if (day <= 10) return 'Define';
  if (day <= 15) return 'Develop';
  return 'Deliver';
};

// ─── GET user's journey progress ───────────────────────────────────
router.get('/:userId/phase/:phase', async (req, res) => {
  const { userId, phase } = req.params;

  const range = phaseRanges[phase];
  if (!range) {
    return res.status(400).json({ success: false, message: 'Invalid phase. Use: Discover, Define, Develop, Deliver' });
  }

  const { data, error } = await supabase
    .from('user_quest_progress')
    .select('day_number')
    .eq('user_id', parseInt(userId))
    .gte('day_number', range[0])
    .lte('day_number', range[1]);

  if (error) return res.status(500).json({ success: false, message: error.message });

  const daysInPhase = Array.from({ length: range[1] - range[0] + 1 }, (_, i) => range[0] + i);
  const completedInPhase = data.map(row => row.day_number);

  res.json({
    success: true,
    data: {
      phase,
      days_in_phase: daysInPhase,
      completed_days: completedInPhase,
      completion_percentage: Math.round((completedInPhase.length / daysInPhase.length) * 100)
    }
  });
});

// ─── GET overall journey stats ──────────────────────────────────────
router.get('/:userId/stats', async (req, res) => {
  const { userId } = req.params;

  const [progressRes, achievementsRes] = await Promise.all([
    supabase.from('user_quest_progress').select('day_number, completed_at').eq('user_id', parseInt(userId)),
    supabase.from('user_achievements').select('achievement_id').eq('user_id', parseInt(userId))
  ]);

  if (progressRes.error) return res.status(500).json({ success: false, message: progressRes.error.message });

  const completedDays = progressRes.data.map(row => row.day_number);
  const currentDay = completedDays.length > 0 ? Math.min(Math.max(...completedDays) + 1, 20) : 1;
  const lastActivity = progressRes.data.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0];

  res.json({
    success: true,
    data: {
      user_id: userId,
      current_day: currentDay,
      total_days_completed: completedDays.length,
      total_days_remaining: 20 - completedDays.length,
      journey_progress: Math.round((completedDays.length / 20) * 100),
      total_points: completedDays.length * 10,
      badges_earned: achievementsRes.data?.length || 0,
      current_phase: getPhaseByDay(currentDay),
      last_activity_at: lastActivity?.completed_at || null
    }
  });
});

// ─── GET user's full progress ───────────────────────────────────────
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from('user_quest_progress')
    .select('day_number, completed_at')
    .eq('user_id', parseInt(userId))
    .order('day_number', { ascending: true });

  if (error) return res.status(500).json({ success: false, message: error.message });

  const completedDays = data.map(row => row.day_number);
  const currentDay = completedDays.length > 0 ? Math.min(Math.max(...completedDays) + 1, 20) : 1;

  res.json({
    success: true,
    data: {
      user_id: userId,
      current_day: currentDay,
      current_phase: getPhaseByDay(currentDay),
      completed_days: completedDays,
      total_points: completedDays.length * 10,
      progress_percentage: Math.round((completedDays.length / 20) * 100),
      days_remaining: 20 - completedDays.length,
      last_activity_at: data[data.length - 1]?.completed_at || null
    }
  });
});

// ─── Mark day as completed ──────────────────────────────────────────
router.post('/:userId/complete-day', async (req, res) => {
  const { userId } = req.params;
  const { dayNumber } = req.body;

  if (!dayNumber || dayNumber < 1 || dayNumber > 20) {
    return res.status(400).json({ success: false, message: 'Valid dayNumber (1-20) is required' });
  }

  // Check user exists
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('user_id, full_name')
    .eq('user_id', parseInt(userId))
    .single();

  if (userError) return res.status(404).json({ success: false, message: 'User not found' });

  // Mark day as completed
  const { error } = await supabase
    .from('user_quest_progress')
    .upsert({ user_id: parseInt(userId), day_number: dayNumber }, { onConflict: 'user_id,day_number' });

  if (error) return res.status(500).json({ success: false, message: error.message });

  // Get updated progress
  const { data: progressData } = await supabase
    .from('user_quest_progress')
    .select('day_number')
    .eq('user_id', parseInt(userId));

  const completedDays = progressData.map(row => row.day_number);
  const currentDay = Math.min(Math.max(...completedDays) + 1, 20);

  res.json({
    success: true,
    message: `Day ${dayNumber} marked as completed`,
    data: {
      user_id: userId,
      full_name: user.full_name,
      current_day: currentDay,
      current_phase: getPhaseByDay(currentDay),
      completed_days: completedDays.sort((a, b) => a - b),
      total_points: completedDays.length * 10,
      progress_percentage: Math.round((completedDays.length / 20) * 100)
    }
  });
  // In your progress route or users route, after marking day complete,
  // automatically award the badge — add this inside completeDay handler:

  // After successful upsert of user_quest_progress...

  // Auto-award badge if one exists for this day
  const { data: achievement } = await supabase
    .from('achievements')
    .select('*')
    .eq('requirement_type', 'day')
    .eq('requirement_value', parseInt(day_number))
    .single();

  if (achievement) {
    await supabase
      .from('user_achievements')
      .upsert(
        { user_id: parseInt(user_id), achievement_id: achievement.achievement_id },
        { onConflict: 'user_id,achievement_id', ignoreDuplicates: true }
      );
  }
});

module.exports = router;