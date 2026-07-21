const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema(
  {
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
    type: { type: String, enum: ['sample', 'public', 'hidden'], default: 'public' },
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isEdgeCase: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TestCase', testCaseSchema);
