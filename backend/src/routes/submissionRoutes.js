const express = require('express');
const router = express.Router();
const { runCode, submitCode, getMySubmissions, getSubmissionById } = require('../controllers/submissionController');
const { protect } = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const { submissionLimiter } = require('../middlewares/rateLimiter');

router.post('/run', protect, roleGuard('student', 'trainer', 'admin'), submissionLimiter, runCode);
router.post('/submit', protect, roleGuard('student', 'trainer', 'admin'), submissionLimiter, submitCode);
router.get('/me', protect, getMySubmissions);
router.get('/:id', protect, getSubmissionById);

module.exports = router;
