const express = require('express');
const router = express.Router();
const { createAssessment, inviteCandidates, getAssessmentResults, logProctoringEvent } = require('../controllers/assessmentController');
const { protect } = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');

router.post('/', protect, roleGuard('recruiter', 'admin'), createAssessment);
router.post('/:id/invite', protect, roleGuard('recruiter', 'admin'), inviteCandidates);
router.get('/:id/results', protect, roleGuard('recruiter', 'admin'), getAssessmentResults);
router.post('/:id/proctor', protect, logProctoringEvent);

module.exports = router;
