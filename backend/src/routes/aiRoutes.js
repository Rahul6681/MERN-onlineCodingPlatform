const express = require('express');
const router = express.Router();
const { getHint, getReview, getComplexity, getDebug, getRecommend } = require('../controllers/aiController');
const { protect } = require('../middlewares/auth');

router.post('/hint', protect, getHint);
router.post('/review', protect, getReview);
router.post('/complexity', protect, getComplexity);
router.post('/debug', protect, getDebug);
router.post('/recommend', protect, getRecommend);

module.exports = router;
