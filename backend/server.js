require('express-async-errors');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const supabase = require('./supabase');

supabase.from('users').select('count').then(({ data, error }) => {
  if (error) console.error('❌ Supabase connection failed:', error.message);
  else console.log('✅ Supabase connected successfully');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/quests', require('./routes/quests'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/badges', require('./routes/badges'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 Backend ready for Makers Innovation Quest`);
});

module.exports = app;
