const Badge = require('../models/Badge');
const Achievement = require('../models/Achievement');
const User = require('../models/User');

const evaluateUserBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const badges = await Badge.find();
    const existingAchievements = await Achievement.find({ user: userId });
    const earnedBadgeIds = new Set(existingAchievements.map((a) => a.badge.toString()));

    for (const badge of badges) {
      if (earnedBadgeIds.has(badge._id.toString())) continue;

      let qualify = false;
      const { category, threshold } = badge.criteria;

      if (category === 'problemsSolved' && (user.stats?.problemsSolved || 0) >= threshold) {
        qualify = true;
      } else if (category === 'contestRating' && (user.stats?.contestRating || 1200) >= threshold) {
        qualify = true;
      } else if (category === 'streak' && (user.stats?.streakCount || 0) >= threshold) {
        qualify = true;
      }

      if (qualify) {
        await Achievement.create({ user: userId, badge: badge._id });
        console.log(`[Badge Earned]: User ${user.name} earned badge "${badge.name}"!`);
      }
    }
  } catch (error) {
    console.error('[Badge Engine Error]:', error.message);
  }
};

module.exports = { evaluateUserBadges };
