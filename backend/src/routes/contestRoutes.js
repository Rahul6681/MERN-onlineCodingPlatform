const express = require('express');
const router = express.Router();
const { getContests, getContestById, createContest, joinContest, getContestLeaderboard } = require('../controllers/contestController');
const { protect } = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');

router.get('/', getContests);
router.get('/:id', getContestById);
router.post('/', protect, roleGuard('trainer', 'admin'), createContest);
router.post('/:id/join', protect, roleGuard('student', 'admin'), joinContest);
router.get('/:id/leaderboard', getContestLeaderboard);

module.exports = router;
