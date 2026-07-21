const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    problems: [
      {
        problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
        dayOrder: { type: Number, default: 1 },
      },
    ],
    category: { type: String, default: 'DSA' },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningPath', learningPathSchema);
