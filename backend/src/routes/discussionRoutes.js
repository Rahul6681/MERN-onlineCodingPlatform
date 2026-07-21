const express = require('express');
const router = express.Router();
const { getDiscussionsByProblem, createDiscussion, upvoteDiscussion } = require('../controllers/discussionController');
const { protect } = require('../middlewares/auth');

router.get('/:problemId', protect, getDiscussionsByProblem);
router.post('/:problemId', protect, createDiscussion);
router.post('/:problemId/:commentId/upvote', protect, upvoteDiscussion);

module.exports = router;
