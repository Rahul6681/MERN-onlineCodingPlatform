const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const redisService = require('../config/redis');

const getGlobalLeaderboard = async (req, res, next) => {
  try {
    const cached = await redisService.get('leaderboard:global');
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached), cached: true });
    }

    const topUsers = await User.find({ isBanned: false })
      .select('name avatarUrl stats profile')
      .sort({ 'stats.contestRating': -1, 'stats.problemsSolved': -1 })
      .limit(100);

    const standings = topUsers.map((user, idx) => ({
      rank: idx + 1,
      user: {
        id: user._id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        university: user.profile?.university || 'Global Student',
      },
      rating: user.stats?.contestRating || 1200,
      problemsSolved: user.stats?.problemsSolved || 0,
      acceptanceRate: user.stats?.acceptanceRate || 0,
    }));

    await redisService.set('leaderboard:global', JSON.stringify(standings), 300);

    res.json({ success: true, data: standings });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGlobalLeaderboard };
