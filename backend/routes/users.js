const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// ✅ POST routes first
router.post('/create', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (existingUser) {
    return res.json({ success: true, message: 'User already exists', data: existingUser });
  }

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      full_name: name,
      user_name: email.split('@')[0],
      email,
      password_hash: 'N/A',
      role: 'user',
      status: 'active'
    })
    .select()
    .single();

  if (error) return res.status(500).json({ success: false, message: error.message });

  res.status(201).json({ success: true, message: 'User created successfully', data: newUser });
});

// ✅ Specific routes BEFORE generic /:userId
router.get('/:userId/stats', async (req, res) => {
  const { userId } = req.params;

  const [userRes, progressRes, achievementsRes] = await Promise.all([
    supabase.from('users').select('*').eq('user_id', parseInt(userId)).single(),
    supabase.from('user_quest_progress').select('day_number').eq('user_id', parseInt(userId)),
    supabase.from('user_achievements').select('achievement_id').eq('user_id', parseInt(userId))
  ]);

  if (userRes.error) return res.status(404).json({ success: false, message: 'User not found' });

  const completedDays = progressRes.data.map(row => row.day_number);
  const currentDay = completedDays.length > 0 ? Math.max(...completedDays) + 1 : 1;

  const stats = {
    user: userRes.data,
    total_days_completed: completedDays.length,
    completed_days: completedDays.sort((a, b) => a - b),
    current_day: Math.min(currentDay, 20),
    badges_earned: achievementsRes.data?.length || 0,
    progress_percentage: Math.round((completedDays.length / 20) * 100)
  };

  res.json({ success: true, data: stats });
});

router.put('/:userId/progress', async (req, res) => {
  const { userId } = req.params;
  const { day_number } = req.body;

  if (!day_number || day_number < 1 || day_number > 20) {
    return res.status(400).json({ success: false, message: 'day_number must be between 1 and 20' });
  }

  const { error } = await supabase
    .from('user_quest_progress')
    .upsert({ user_id: parseInt(userId), day_number }, { onConflict: 'user_id,day_number' });

  if (error) return res.status(500).json({ success: false, message: error.message });

  res.json({ success: true, message: `Day ${day_number} marked as completed` });
});

// ✅ Generic /:userId route LAST
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  console.log('userId:', userId); // ✅ moved before the query

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', parseInt(userId))
    .single();

  console.log('data:', user);
  console.log('error:', error);

  if (error) return res.status(404).json({ success: false, message: 'User not found' });

  res.json({ success: true, data: user });
});

module.exports = router;