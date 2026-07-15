const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const {
  buildSchedule,
  getPhaseSchedule,
  isDayUnlocked,
  toDateString,
  getDayDate
} = require('./ScheduleHelper.js');

// ─── Quest content ────────────────────────────────────────────────────────────
const questsData = {
  1:  { 
    day: 1,  
    title: 'Welcome to the Quest',   
    phase: 'Discover', 
    description: `Hi {user_name} — welcome to the Quest.

      Today is your starting point. We're not here to be perfect. We're here to begin with curiosity.

      Today, your AI guide will help you:

      • Explore the Quest Map
      • Understand the Double Diamond
      • Reflect on what excites or worries you about your future
      • Check in with where you are now
      • Create your Day 1 outputs

      Today's Outputs:
      • Personal learner profile
      • Starting reflection
      • Quest pledge

      Daily Unlock Password:
      -> Spark Curiosity
      `,
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: 'https://forms.office.com/Pages/ResponsePage.aspx?id=7GGUHmJTKUOuRmH6PpHG0kZVRRdxSX1IlNb3E5Tqm1pUNFBWV1I4MzVZODYzTVdSQ1NGUTU0TkpKSC4u' 
  },
  2:  { 
    day: 2,  
    title: 'Observation Skills',     
    phase: 'Discover', 
    description: `Hi {user_name} — welcome to Day 2.

      Today we’ll rethink what innovation really means.

      Innovation is not only about invention, technology, or building something flashy. It often begins with a real frustration, an unmet need, or a problem people face every day.

      In this session, we’ll look at different kinds of innovation, explore simple examples, and help you identify one challenge in student life that could be improved.

      By the end, you’ll write your own “innovation is…” reflection and identify one everyday challenge worth noticing.

      Daily unlock password:
      -> Begin Journeys
    `,
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: 'https://forms.office.com/r/PmMQRLDAwX' 
  },
  3:  { 
    day: 3,  
    title: 'Ask Questions',          
    phase: 'Discover', 
    description: `Hi {user_name} — welcome to Day 3.

      Today we’ll practice one of the most important design skills: observation.

      Designers do not just wait for problems to be explained to them. They learn to notice what people do, where people struggle, what they avoid, and how they adapt when something doesn’t work well.

      In this session, you’ll learn how to observe everyday life with fresh eyes. Then you’ll do a short observation activity and capture 5 observation notes and 1 surprising insight.

      Today is not about fixing anything yet. It is about noticing carefully.

      Daily unlock password:
      -> Practice Empathy
    `,
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: 'https://forms.office.com/Pages/ResponsePage.aspx?id=7GGUHmJTKUOuRmH6PpHG0kZVRRdxSX1IlNb3E5Tqm1pUQUpIRVFJM0FYMVJLSEUwRjZFUEM1WExXUC4u' 
  },
  4:  { 
    day: 4,  
    title: 'Listen Actively',        
    phase: 'Discover', 
    description: `Hi {user_name} — welcome to Day 4. People First.

      Today, you will choose one target user group and create an empathy map showing what they do, feel, struggle with, and hope for.
      
      Use evidence from your observations. Mark uncertain information as “Need to learn more.”

      Worksheet: [Day4_Empathy_Map_Worksheet.pptx](https://docs.google.com/presentation/d/19qSWylBk2UKysvNhEDGgaaCJ0fLDiULA/edit?usp=sharing&ouid=113586029234761052272&rtpof=true&sd=true)

      Complete the worksheet with AIFFL, submit it through the form, then return and mark Day 4 complete.

      Daily unlock password:
      -> Uncover Needs
    `,
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: 'https://forms.office.com/Pages/ResponsePage.aspx?id=7GGUHmJTKUOuRmH6PpHG0kZVRRdxSX1IlNb3E5Tqm1pUNDM1UkxFSTJERExCVk5ZSk8wNEtMQllUQi4u' 
  },
  5:  { 
    day: 5,  
    title: 'Synthesis',              
    phase: 'Discover', 
    description: `Hi {user_name} — welcome to Day 5: Ask Better Questions.

      Today, you will learn how to talk to real people and learn from their experiences.

      Your mission is to prepare 5–7 open-ended interview questions, interview one peer or target user, and capture what you learned.

      Remember: good designers do not interview people to prove their idea is right. They interview people because they are curious.

      Download your Day 5 worksheet: [Day5_Interview_Worksheet.pptx](https://docs.google.com/presentation/d/1qDkKZWatHJo65yhYCDoRVjNwTlgJIIzd/edit?usp=sharing&ouid=113586029234761052272&rtpof=true&sd=true)

      AIFFL will help you improve your questions before you interview someone. After the interview, complete the worksheet with your interview notes, direct quotes, top 3 things learned, and reflection.

      Daily unlock password:
      -> Build Courage
    `,
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: 'https://forms.office.com/Pages/ResponsePage.aspx?id=7GGUHmJTKUOuRmH6PpHG0kZVRRdxSX1IlNb3E5Tqm1pUM0ZYUkRHSkFUWTk2UjNMRjVBUjQ2M0lUWS4u' 
  },
  6:  { 
    day: 6,  
    title: 'Problem Framing',        
    phase: 'Define',   
    description: 'Frame the problem statement.',
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: 'https://forms.office.com/Pages/ResponsePage.aspx?id=7GGUHmJTKUOuRmH6PpHG0kZVRRdxSX1IlNb3E5Tqm1pURUtUMVk1RUU4Vk9JM080UFBSSVNUUFg3Sy4u' 
  },
  7:  { 
    day: 7,  
    title: 'Need Identification',    
    phase: 'Define',   
    description: 'Identify user needs.',
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: 'https://forms.office.com/Pages/ResponsePage.aspx?id=7GGUHmJTKUOuRmH6PpHG0kZVRRdxSX1IlNb3E5Tqm1pUQUE1M1MxMFJCUkVVU0I5OFpBOVFGOTIyOS4u' 
  },
  8:  { 
    day: 8,  
    title: 'Point of View Power',    
    phase: 'Define',   
    description: 'Write a point of view statement.',
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: 'https://forms.office.com/Pages/ResponsePage.aspx?id=7GGUHmJTKUOuRmH6PpHG0kZVRRdxSX1IlNb3E5Tqm1pUNlgzUlhCNk5KT0dZSUVOUE1HWlNVTzNaTS4u' 
  },
  9:  { 
    day: 9,  
    title: 'Insight Analysis',       
    phase: 'Define',   
    description: 'Analyze your key insights.',
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: 'https://forms.office.com/Pages/ResponsePage.aspx?id=7GGUHmJTKUOuRmH6PpHG0kZVRRdxSX1IlNb3E5Tqm1pUNFlENkxMQU5DUkRQTzczNURZSFdRU0JJVS4u' 
  },
  10: { 
    day: 10, 
    title: 'Define Summary',         
    phase: 'Define',   
    description: 'Summarize your problem definition.',
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: '' 
  },
  11: { 
    day: 11, 
    title: 'Brainstorming',          
    phase: 'Develop',  
    description: 'Generate creative ideas.',
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: '' 
  },
  12: { 
    day: 12, 
    title: 'Ideation Techniques',    
    phase: 'Develop',  
    description: 'Learn ideation methods.',
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: '' 
  },
  13: { 
    day: 13, 
    title: 'Solution Sketching',     
    phase: 'Develop',  
    description: 'Sketch your ideas.',
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: '' 
  },
  14: { 
    day: 14, 
    title: 'Prototype Planning',     
    phase: 'Develop',  
    description: 'Plan your prototype.',
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: '' 
  },
  15: { 
    day: 15, 
    title: 'Develop Review',         
    phase: 'Develop',  
    description: 'Review your ideas.',
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: '' 
  },
  16: { 
    day: 16, 
    title: 'Build Your Solution',    
    phase: 'Deliver',  
    description: 'Start building.',
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: '' 
  },
  17: { 
    day: 17, 
    title: 'Testing Phase',          
    phase: 'Deliver',  
    description: 'Test your solution.',
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: '' 
  },
  18: { 
    day: 18, 
    title: 'Gather Feedback',        
    phase: 'Deliver',  
    description: 'Collect user feedback.',
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: '' 
  },
  19: { 
    day: 19, 
    title: 'Iterate & Improve',      
    phase: 'Deliver',  
    description: 'Make improvements.',
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: '' 
  },
  20: { 
    day: 20, 
    title: 'Launch & Share',         
    phase: 'Deliver',  
    description: 'Share your solution.',
    gpt_link: 'https://chatgpt.com/g/g-6a1960f5ba488191b1f12023200567f8-aiffl-innovation-navigators',
    submit_link: '' 
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Attach schedule info (date, dateLabel, unlocked) to a quest object
function withSchedule(quest) {
  const schedule = buildSchedule();
  const s = schedule[quest.day - 1];
  return { ...quest, ...s };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/quests — all quests with schedule info
router.get('/', (req, res) => {
  const schedule = buildSchedule();
  const data = Object.values(questsData).map((q) => ({
    ...q,
    ...schedule[q.day - 1]
  }));
  res.json({ success: true, data, total: data.length });
});

// GET /api/quests/schedule — just the schedule (useful for frontend date display)
router.get('/schedule', (req, res) => {
  const schedule = buildSchedule();
  const phases = [
    { name: 'Discover', startDay: 1,  endDay: 5  },
    { name: 'Define',   startDay: 6,  endDay: 10 },
    { name: 'Develop',  startDay: 11, endDay: 15 },
    { name: 'Deliver',  startDay: 16, endDay: 20 },
  ];
  res.json({
    success: true,
    data: {
      schedule,
      phases: phases.map((p) => ({
        ...p,
        dateRange: getPhaseSchedule(p.startDay, p.endDay)
      }))
    }
  });
});

// GET /api/quests/day/:dayNumber
router.get('/day/:dayNumber', (req, res) => {
  const { dayNumber } = req.params;
  const quest = questsData[dayNumber];

  if (!quest) {
    return res.status(404).json({ success: false, message: `Quest for day ${dayNumber} not found` });
  }

  res.json({
    success: true,
    data: {
      ...withSchedule(quest),
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

// GET /api/quests/phase/:phase
router.get('/phase/:phase', (req, res) => {
  const { phase } = req.params;
  const schedule = buildSchedule();
  const phaseQuests = Object.values(questsData)
    .filter((q) => q.phase === phase)
    .map((q) => ({ ...q, ...schedule[q.day - 1] }));

  if (phaseQuests.length === 0) {
    return res.status(404).json({ success: false, message: `No quests found for phase: ${phase}` });
  }

  res.json({ success: true, data: phaseQuests, total: phaseQuests.length });
});

// GET /api/quests/day/:dayNumber/user/:userId
router.get('/day/:dayNumber/user/:userId', async (req, res) => {
  const { dayNumber, userId } = req.params;
  const quest = questsData[dayNumber];

  if (!quest) {
    return res.status(404).json({ success: false, message: `Quest for day ${dayNumber} not found` });
  }

  const { data: progress } = await supabase
    .from('user_quest_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('day_number', dayNumber)
    .single();

  res.json({
    success: true,
    data: {
      ...withSchedule(quest),
      completed: !!progress,
      completed_at: progress?.completed_at || null
    }
  });
});

// GET /api/quests/user/:userId — all quests with user completion + schedule
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data: progress, error } = await supabase
    .from('user_quest_progress')
    .select('day_number, completed_at')
    .eq('user_id', userId);

  if (error) return res.status(500).json({ success: false, message: error.message });

  const completedMap = new Map(progress.map((p) => [p.day_number, p.completed_at]));
  const schedule = buildSchedule();

  const quests = Object.values(questsData).map((quest) => ({
    ...quest,
    ...schedule[quest.day - 1],              // date, dateLabel, unlocked
    completed: completedMap.has(quest.day),
    completed_at: completedMap.get(quest.day) || null
  }));

  res.json({ success: true, data: quests, total_completed: progress.length });
});

// POST /api/quests/complete
router.post('/complete', async (req, res) => {
  const { user_id, day_number } = req.body;

  if (!user_id || !day_number) {
    return res.status(400).json({ success: false, message: 'user_id and day_number are required' });
  }

  if (!questsData[day_number]) {
    return res.status(404).json({ success: false, message: `Quest for day ${day_number} not found` });
  }

  // Prevent completing a day that hasn't unlocked yet
  if (!isDayUnlocked(day_number)) {
    const dateLabel = getDayDate(day_number).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC'
    });
    return res.status(403).json({
      success: false,
      message: `Day ${day_number} is not available until ${dateLabel}`
    });
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
    data: { ...withSchedule(questsData[day_number]), completed_at: data.completed_at }
  });
});

module.exports = router;