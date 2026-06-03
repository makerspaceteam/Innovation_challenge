const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory submissions storage (In production, use a database)
const submissionsMap = new Map();

// Create quest submission
router.post('/create', (req, res) => {
  const { userId, dayNumber, response, phase } = req.body;

  if (!userId || !dayNumber || !response) {
    return res.status(400).json({
      success: false,
      message: 'userId, dayNumber, and response are required'
    });
  }

  const submission = {
    id: uuidv4(),
    userId,
    dayNumber: parseInt(dayNumber),
    phase,
    response,
    submittedAt: new Date().toISOString(),
    feedback: null,
    pointsEarned: 10
  };

  const userSubmissions = Array.from(submissionsMap.values()).filter(s => s.userId === userId);
  const submissionId = `${userId}-${dayNumber}`;

  submissionsMap.set(submissionId, submission);

  res.status(201).json({
    success: true,
    message: 'Quest submission recorded',
    data: submission
  });
});

// Get submissions by user
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const userSubmissions = Array.from(submissionsMap.values())
    .filter(s => s.userId === userId)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  res.json({
    success: true,
    data: userSubmissions,
    total: userSubmissions.length
  });
});

// Get submission by user and day
router.get('/:userId/:dayNumber', (req, res) => {
  const { userId, dayNumber } = req.params;
  const submissionId = `${userId}-${dayNumber}`;
  const submission = submissionsMap.get(submissionId);

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found'
    });
  }

  res.json({
    success: true,
    data: submission
  });
});

// Update submission with feedback
router.put('/:submissionId/feedback', (req, res) => {
  const { submissionId } = req.params;
  const { feedback, rating } = req.body;

  // Find submission by userId and dayNumber
  let submission = null;
  for (let [key, value] of submissionsMap.entries()) {
    if (value.id === submissionId) {
      submission = value;
      break;
    }
  }

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found'
    });
  }

  submission.feedback = feedback;
  submission.rating = rating;
  submission.feedbackAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Feedback added successfully',
    data: submission
  });
});

// Get all submissions (for admin)
router.get('/', (req, res) => {
  const submissions = Array.from(submissionsMap.values())
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  res.json({
    success: true,
    data: submissions,
    total: submissions.length
  });
});

module.exports = router;
