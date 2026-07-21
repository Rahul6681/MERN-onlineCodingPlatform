const express = require('express');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const applySecurityMiddlewares = require('./middlewares/security');
const errorHandler = require('./middlewares/errorHandler');
const configurePassport = require('./config/passport');

// Import Route Modules
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const problemRoutes = require('./routes/problemRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const contestRoutes = require('./routes/contestRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const interviewPrepRoutes = require('./routes/interviewPrepRoutes');
const learningPathRoutes = require('./routes/learningPathRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const server = http.createServer(app);

// Connect DB & Passport
connectDB();
configurePassport();

// Socket.IO Setup
initSocket(server);

// Security & Body Parsers
applySecurityMiddlewares(app);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Base Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/discuss', discussionRoutes);
app.use('/api/interview-prep', interviewPrepRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CodeArena Backend API', timestamp: new Date() });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 CodeArena Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

module.exports = { app, server };
