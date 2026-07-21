const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: true },
  status: { type: String, enum: ['Invited', 'InProgress', 'Completed'], default: 'Invited' },
  score: { type: Number, default: 0 },
  proctoringFlags: [{ type: String }],
});

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
    durationMinutes: { type: Number, default: 60 },
    candidates: [candidateSchema],
    randomizeQuestions: { type: Boolean, default: true },
    proctoringEnabled: { type: Boolean, default: true },
    resultSummary: {
      avgScore: { type: Number, default: 0 },
      topCandidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
