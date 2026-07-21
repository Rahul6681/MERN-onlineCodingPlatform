const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    scope: { type: String, enum: ['global', 'contest'], default: 'global' },
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', default: null },
    entries: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, default: 1200 },
        rank: { type: Number, required: true },
        problemsSolved: { type: Number, default: 0 },
        contestsAttended: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

leaderboardSchema.index({ 'entries.rank': 1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
