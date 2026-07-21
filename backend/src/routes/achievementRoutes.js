const express = require('express');
const router = express.Router();
const { getMyAchievements } = require('../controllers/achievementController');
const { protect } = require('../middlewares/auth');

router.get('/me', protect, getMyAchievements);

module.exports = router;
