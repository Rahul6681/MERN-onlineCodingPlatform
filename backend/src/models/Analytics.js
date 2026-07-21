const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    scope: { type: String, enum: ['student', 'trainer', 'recruiter', 'platform'], required: true },
    refId: { type: mongoose.Schema.Types.ObjectId, default: null },
    metrics: { type: mongoose.Schema.Types.Mixed, required: true },
    date: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analytics', analyticsSchema);
