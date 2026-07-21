const express = require('express');
const router = express.Router();
const {
  getStudentAnalytics,
  getTrainerAnalytics,
  getRecruiterAnalytics,
  getPlatformAnalytics,
} = require('../controllers/analyticsController');
const { protect } = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');

router.get('/student/:id?', protect, getStudentAnalytics);
router.get('/trainer/:id?', protect, roleGuard('trainer', 'admin'), getTrainerAnalytics);
router.get('/recruiter/:id?', protect, roleGuard('recruiter', 'admin'), getRecruiterAnalytics);
router.get('/platform', protect, roleGuard('admin'), getPlatformAnalytics);

module.exports = router;
