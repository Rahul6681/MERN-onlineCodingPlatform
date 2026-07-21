const Achievement = require('../models/Achievement');
const Badge = require('../models/Badge');

const getMyAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({ user: req.user._id }).populate('badge');
    const allBadges = await Badge.find();

    const earnedBadgeIds = new Set(achievements.map((a) => a.badge._id.toString()));
    const badgeProgress = allBadges.map((badge) => ({
      badge,
      unlocked: earnedBadgeIds.has(badge._id.toString()),
      earnedAt: achievements.find((a) => a.badge._id.toString() === badge._id.toString())?.earnedAt || null,
    }));

    res.json({
      success: true,
      data: {
        totalEarned: achievements.length,
        totalAvailable: allBadges.length,
        badges: badgeProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyAchievements };
