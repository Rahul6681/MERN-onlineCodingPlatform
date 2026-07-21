const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', default: null },
    language: { type: String, required: true },
    code: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'Pending',
        'Accepted',
        'WrongAnswer',
        'RuntimeError',
        'CompilationError',
        'TimeLimitExceeded',
        'MemoryLimitExceeded',
      ],
      default: 'Pending',
    },
    executionTimeMs: { type: Number, default: 0 },
    memoryUsedKb: { type: Number, default: 0 },
    testCaseResults: [
      {
        testCase: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' },
        passed: { type: Boolean, required: true },
        actualOutput: { type: String },
        runtimeMs: { type: Number, default: 0 },
      },
    ],
    score: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

submissionSchema.index({ user: 1, problem: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
