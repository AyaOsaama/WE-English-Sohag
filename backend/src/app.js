const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sanitize } = require('./utils/validate');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

function createApp() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set (see backend/.env.example)');
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','), credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  // Remove Mongo operator keys ("$ne", "a.b") from user input before it reaches a query.
  app.use((req, _res, next) => {
    req.body = sanitize(req.body);
    next();
  });

  app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/dashboard', require('./routes/dashboardRoutes'));
  app.use('/api/courses', require('./routes/courseRoutes'));
  app.use('/api/units', require('./routes/unitRoutes'));
  app.use('/api/lessons', require('./routes/lessonRoutes'));
  app.use('/api/vocabulary', require('./routes/vocabularyRoutes'));
  app.use('/api/speaking', require('./routes/speakingRoutes'));
  app.use('/api/ai', require('./routes/aiRoutes'));
  app.use('/api/challenges', require('./routes/challengeRoutes'));
  app.use('/api/badges', require('./routes/badgeRoutes'));
  app.use('/api/progress', require('./routes/progressRoutes'));
  app.use('/api/xp', require('./routes/xpRoutes'));
  app.use('/api/announcements', require('./routes/announcementRoutes'));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
