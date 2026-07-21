const express = require('express');
const router = express.Router();
const { getCompanyProblems, getCodingPatterns, createMockAssessment } = require('../controllers/interviewPrepController');
const { protect } = require('../middlewares/auth');

router.get('/companies', getCompanyProblems);
router.get('/patterns', getCodingPatterns);
router.post('/mock-assessment', protect, createMockAssessment);

module.exports = router;
