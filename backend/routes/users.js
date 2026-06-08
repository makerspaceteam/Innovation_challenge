const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');
const authenticate = require('../middleware/auth');

const TEMP_PW = 'cadt1234';

// ✅ POST /users/create — public
router.post('/create', async (req, res) => {
  const { name, email, password } = req.body;

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
      password_hash: password || TEMP_PW,
      role: 'user',
      status: 'active'
    })
    .select()
    .single();

  if (error) return res.status(500).json({ success: false, message: error.message });

  res.status(201).json({ success: true, message: 'User created successfully', data: newUser });
});

// ✅ POST /users/login — public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return res.status(404).json({ success: false, message: 'No account found with this email' });
  }

  // Plain text comparison
  if (password !== user.password_hash) {
    return res.status(401).json({ success: false, message: 'Incorrect password' });
  }

  const isTempPassword = user.password_hash === TEMP_PW;

  // Generate JWT token
  const token = jwt.sign(
    { user_id: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    message: 'Login successful',
    token,
    data: user,
    requiresPasswordChange: isTempPassword
  });
});

// ✅ PUT /users/:userId/change-password — protected
router.put('/:userId/change-password', authenticate, async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
  }

  if (newPassword === TEMP_PW) {
    return res.status(400).json({ success: false, message: 'Cannot reuse your temporary password' });
  }

  // Store as plain text
  const { error } = await supabase
    .from('users')
    .update({ password_hash: newPassword })
    .eq('user_id', parseInt(userId));

  if (error) return res.status(500).json({ success: false, message: error.message });

  res.json({ success: true, message: 'Password updated successfully' });
});

// ✅ GET /users/:userId/stats — protected
router.get('/:userId/stats', authenticate, async (req, res) => {
  const { userId } = req.params;

  const [userRes, progressRes, achievementsRes] = await Promise.all([
    supabase.from('users').select('*').eq('user_id', parseInt(userId)).single(),
    supabase.from('user_quest_progress').select('day_number').eq('user_id', parseInt(userId)),
    supabase.from('user_achievements').select('achievement_id').eq('user_id', parseInt(userId))
  ]);

  if (userRes.error) return res.status(404).json({ success: false, message: 'User not found' });

  const completedDays = progressRes.data.map(row => row.day_number);
  const currentDay = completedDays.length > 0 ? Math.max(...completedDays) + 1 : 1;

  res.json({
    success: true,
    data: {
      user: userRes.data,
      total_days_completed: completedDays.length,
      completed_days: completedDays.sort((a, b) => a - b),
      current_day: Math.min(currentDay, 20),
      badges_earned: achievementsRes.data?.length || 0,
      progress_percentage: Math.round((completedDays.length / 20) * 100)
    }
  });
});

// ✅ PUT /users/:userId/progress — protected
router.put('/:userId/progress', authenticate, async (req, res) => {
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

// ✅ GET /users/:userId — protected
router.get('/:userId', authenticate, async (req, res) => {
  const { userId } = req.params;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', parseInt(userId))
    .single();

  if (error) return res.status(404).json({ success: false, message: 'User not found' });

  res.json({ success: true, data: user });
});

module.exports = router;