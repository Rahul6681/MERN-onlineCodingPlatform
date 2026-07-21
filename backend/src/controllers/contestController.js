const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const Leaderboard = require('../models/Leaderboard');
const { getIO } = require('../config/socket');

const getContests = async (req, res, next) => {
  try {
    const contests = await Contest.find({ isPublished: true })
      .populate('problems', 'title slug difficulty')
      .sort({ startTime: -1 });

    const now = new Date();
    const updated = contests.map((c) => {
      const isLive = now >= new Date(c.startTime) && now <= new Date(c.endTime);
      return { ...c.toObject(), isLive };
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const getContestById = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('problems', 'title slug difficulty tags stats')
      .populate('participants.user', 'name avatarUrl stats');

    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    const now = new Date();
    const isLive = now >= new Date(contest.startTime) && now <= new Date(contest.endTime);

    res.json({ success: true, data: { ...contest.toObject(), isLive } });
  } catch (error) {
    next(error);
  }
};

const createContest = async (req, res, next) => {
  try {
    const { name, description, type, problems, startTime, endTime, durationMinutes } = req.body;

    const contest = await Contest.create({
      name,
      description,
      type: type || 'Weekly',
      problems: problems || [],
      startTime,
      endTime,
      durationMinutes: durationMinutes || 120,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Contest created successfully', data: contest });
  } catch (error) {
    next(error);
  }
};

const joinContest = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    const existing = contest.participants.find((p) => p.user.toString() === req.user._id.toString());
    if (!existing) {
      contest.participants.push({ user: req.user._id, joinedAt: new Date() });
      await contest.save();
    }

    res.json({ success: true, message: 'Joined contest successfully', data: contest });
  } catch (error) {
    next(error);
  }
};

const getContestLeaderboard = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('participants.user', 'name avatarUrl stats');
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    const now = new Date();
    const endTime = new Date(contest.endTime);
    const minsRemaining = Math.floor((endTime - now) / 60000);
    const isFrozen = minsRemaining >= 0 && minsRemaining <= 10; // Freeze in last 10 minutes

    // Calculate score & ranking
    const standings = contest.participants
      .map((p) => ({
        user: p.user,
        score: p.score || 0,
        penaltyMinutes: p.penaltyMinutes || 0,
        rank: p.rank || 1,
      }))
      .sort((a, b) => b.score - a.score || a.penaltyMinutes - b.penaltyMinutes);

    res.json({
      success: true,
      data: {
        contestId: contest._id,
        isFrozen,
        standings: standings.map((item, idx) => ({ ...item, rank: idx + 1 })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getContests, getContestById, createContest, joinContest, getContestLeaderboard };
