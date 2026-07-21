const Discussion = require('../models/Discussion');
const Submission = require('../models/Submission');

const getDiscussionsByProblem = async (req, res, next) => {
  try {
    const { problemId } = req.params;

    // Check if user has solved the problem (Community Solutions unlock condition like LeetCode)
    const hasSolved = await Submission.exists({
      user: req.user._id,
      problem: problemId,
      status: 'Accepted',
    });

    const threads = await Discussion.find({ problem: problemId })
      .populate('user', 'name avatarUrl')
      .populate('comments.user', 'name avatarUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        unlocked: Boolean(hasSolved),
        threads,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createDiscussion = async (req, res, next) => {
  try {
    const { problemId } = req.params;
    const { title, content } = req.body;

    const thread = await Discussion.create({
      problem: problemId,
      user: req.user._id,
      title,
      content,
    });

    res.status(201).json({ success: true, message: 'Discussion thread posted', data: thread });
  } catch (error) {
    next(error);
  }
};

const upvoteDiscussion = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const thread = await Discussion.findById(commentId);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    const index = thread.upvotes.indexOf(req.user._id);
    if (index === -1) {
      thread.upvotes.push(req.user._id);
    } else {
      thread.upvotes.splice(index, 1);
    }

    await thread.save();
    res.json({ success: true, data: { upvotes: thread.upvotes.length } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDiscussionsByProblem, createDiscussion, upvoteDiscussion };
