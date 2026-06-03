const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// Quest data stays local
const questsData = {
  1:  { day: 1,  title: 'Welcome to the Quest',  phase: 'Discover', description: 'Welcome to the Quest Please complete this form after finishing the Day 1 AI-guided lesson. Today’s task is about understanding the design thinking journey and the Double Diamond. You will submit: your concept check responses your starting reflection your quest pledge Start your journey of exploration.' },
  2:  { day: 2,  title: 'Observation Skills',     phase: 'Discover', description: 'Observe the world around you.' },
  3:  { day: 3,  title: 'Ask Questions',          phase: 'Discover', description: 'Learn to ask meaningful questions.' },
  4:  { day: 4,  title: 'Listen Actively',        phase: 'Discover', description: 'Practice active listening.' },
  5:  { day: 5,  title: 'Synthesis',              phase: 'Discover', description: 'Bring your observations together.' },
  6:  { day: 6,  title: 'Problem Framing',        phase: 'Define',   description: 'Frame the problem statement.' },
  7:  { day: 7,  title: 'Need Identification',    phase: 'Define',   description: 'Identify user needs.' },
  8:  { day: 8,  title: 'Point of View Power',    phase: 'Define',   description: 'Write a point of view statement.' },
  9:  { day: 9,  title: 'Insight Analysis',       phase: 'Define',   description: 'Analyze your key insights.' },
  10: { day: 10, title: 'Define Summary',         phase: 'Define',   description: 'Summarize your problem definition.' },
  11: { day: 11, title: 'Brainstorming',          phase: 'Develop',  description: 'Generate creative ideas.' },
  12: { day: 12, title: 'Ideation Techniques',    phase: 'Develop',  description: 'Learn ideation methods.' },
  13: { day: 13, title: 'Solution Sketching',     phase: 'Develop',  description: 'Sketch your ideas.' },
  14: { day: 14, title: 'Prototype Planning',     phase: 'Develop',  description: 'Plan your prototype.' },
  15: { day: 15, title: 'Develop Review',         phase: 'Develop',  description: 'Review your ideas.' },
  16: { day: 16, title: 'Build Your Solution',    phase: 'Deliver',  description: 'Start building.' },
  17: { day: 17, title: 'Testing Phase',          phase: 'Deliver',  description: 'Test your solution.' },
  18: { day: 18, title: 'Gather Feedback',        phase: 'Deliver',  description: 'Collect user feedback.' },
  19: { day: 19, title: 'Iterate & Improve',      phase: 'Deliver',  description: 'Make improvements.' },
  20: { day: 20, title: 'Launch & Share',         phase: 'Deliver',  description: 'Share your solution.' }
};

// Get all quests
router.get('/', (req, res) => {
  res.json({ success: true, data: Object.values(questsData), total: Object.keys(questsData).length });
});

// Get quest by day
router.get('/day/:dayNumber', (req, res) => {
  const { dayNumber } = req.params;
  const quest = questsData[dayNumber];

  if (!quest) return res.status(404).json({ success: false, message: `Quest for day ${dayNumber} not found` });

  res.json({
    success: true,
    data: {
      ...quest,
      instructions: [
        'Review your previous notes and observations.',
        'Consider the current phase objective.',
        'Complete the daily challenge.'
      ],
      sentenceFrame: `For Day ${dayNumber}, I learned that...`,
      tips: "Take your time and reflect deeply on what you've learned."
    }
  });
});

// Get quest by phase
router.get('/phase/:phase', (req, res) => {
  const { phase } = req.params;
  const phaseQuests = Object.values(questsData).filter(q => q.phase === phase);

  if (phaseQuests.length === 0) {
    return res.status(404).json({ success: false, message: `No quests found for phase: ${phase}` });
  }

  res.json({ success: true, data: phaseQuests, total: phaseQuests.length });
});

// Get quest + user progress for a specific day
router.get('/day/:dayNumber/user/:userId', async (req, res) => {
  const { dayNumber, userId } = req.params;
  const quest = questsData[dayNumber];

  if (!quest) return res.status(404).json({ success: false, message: `Quest for day ${dayNumber} not found` });

  const { data: progress } = await supabase
    .from('user_quest_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('day_number', dayNumber)
    .single();

  res.json({
    success: true,
    data: {
      ...quest,
      completed: !!progress,
      completed_at: progress?.completed_at || null
    }
  });
});

// Get all quests with user completion status
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data: progress, error } = await supabase
    .from('user_quest_progress')
    .select('day_number, completed_at')
    .eq('user_id', userId);

  if (error) return res.status(500).json({ success: false, message: error.message });

  const completedMap = new Map(progress.map(p => [p.day_number, p.completed_at]));

  const quests = Object.values(questsData).map(quest => ({
    ...quest,
    completed: completedMap.has(quest.day),
    completed_at: completedMap.get(quest.day) || null
  }));

  res.json({ success: true, data: quests, total_completed: progress.length });
});

// Mark a quest day as completed
router.post('/complete', async (req, res) => {
  const { user_id, day_number } = req.body;

  if (!user_id || !day_number) {
    return res.status(400).json({ success: false, message: 'user_id and day_number are required' });
  }

  if (!questsData[day_number]) {
    return res.status(404).json({ success: false, message: `Quest for day ${day_number} not found` });
  }

  const { data, error } = await supabase
    .from('user_quest_progress')
    .upsert({ user_id, day_number }, { onConflict: 'user_id,day_number' })
    .select()
    .single();

  if (error) return res.status(500).json({ success: false, message: error.message });

  res.status(201).json({
    success: true,
    message: `Day ${day_number} completed!`,
    data: { ...questsData[day_number], completed_at: data.completed_at }
  });
});

module.exports = router;