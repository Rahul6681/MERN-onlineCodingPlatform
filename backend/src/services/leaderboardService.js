const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const redisService = require('../config/redis');

// Calculate updated ELO rating post contest
const calculateEloRating = (currentRating, rank, totalParticipants) => {
  const K = 32;
  const expectedRank = (totalParticipants + 1) / 2;
  const rankDiff = expectedRank - rank;
  const ratingChange = Math.round(rankDiff * (K / 10));
  return Math.max(800, currentRating + ratingChange);
};

const updateGlobalLeaderboard = async () => {
  try {
    const topUsers = await User.find({ isBanned: false })
      .select('name avatarUrl stats')
      .sort({ 'stats.contestRating': -1, 'stats.problemsSolved': -1 })
      .limit(100);

    const entries = topUsers.map((u, index) => ({
      user: u._id,
      rating: u.stats?.contestRating || 1200,
      rank: index + 1,
      problemsSolved: u.stats?.problemsSolved || 0,
      contestsAttended: 0,
    }));

    await Leaderboard.findOneAndUpdate(
      { scope: 'global', contest: null },
      { scope: 'global', entries },
      { upsert: true, new: true }
    );

    // Also update Redis cache
    await redisService.set('leaderboard:global', JSON.stringify(entries), 3600);
    return entries;
  } catch (error) {
    console.error('[Leaderboard Update Error]:', error.message);
  }
};

module.exports = { calculateEloRating, updateGlobalLeaderboard };
