const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    type: { type: String, enum: ['Weekly', 'Monthly', 'University', 'Hiring'], default: 'Weekly' },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joinedAt: { type: Date, default: Date.now },
        score: { type: Number, default: 0 },
        rank: { type: Number, default: 0 },
        penaltyMinutes: { type: Number, default: 0 },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isLive: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contest', contestSchema);
