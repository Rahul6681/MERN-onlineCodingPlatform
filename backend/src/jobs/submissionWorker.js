const { Worker } = require('bullmq');
const Submission = require('../models/Submission');
const TestCase = require('../models/TestCase');
const User = require('../models/User');
const Problem = require('../models/Problem');
const { executeCode } = require('../services/judge0Service');
const { evaluateUserBadges } = require('../services/badgeService');
const { dispatchNotification } = require('../services/notificationService');
const { getIO } = require('../config/socket');
const redisService = require('../config/redis');

const processSubmissionJob = async (jobData) => {
  const { submissionId, userId, problemId, code, language } = jobData;

  try {
    let testCases = await TestCase.find({ problem: problemId });
    const problem = await Problem.findById(problemId);

    // Fallback to problem examples if no explicit TestCase models found
    if (!testCases || testCases.length === 0) {
      if (problem && problem.examples && problem.examples.length > 0) {
        testCases = problem.examples.map((ex, idx) => ({
          _id: `ex_${idx}`,
          input: ex.input,
          expectedOutput: ex.output,
        }));
      }
    }

    // If still no test cases exist
    if (!testCases || testCases.length === 0) {
      const failedSubmission = await Submission.findByIdAndUpdate(
        submissionId,
        {
          status: 'WrongAnswer',
          score: 0,
          executionTimeMs: 0,
          memoryUsedKb: 0,
          testCaseResults: [],
        },
        { new: true }
      );
      const io = getIO();
      io.to(`user_${userId}`).emit('submission:statusUpdate', failedSubmission);
      return failedSubmission;
    }

    const results = [];
    let overallStatus = 'Accepted';
    let totalTimeMs = 0;
    let maxMemoryKb = 0;
    let passedCount = 0;

    for (const tc of testCases) {
      const execResult = await executeCode({
        code,
        language,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      });

      const passed = Boolean(execResult.passed);
      if (passed) {
        passedCount++;
      } else {
        if (overallStatus === 'Accepted') {
          overallStatus = execResult.status || 'WrongAnswer';
        }
      }

      results.push({
        testCase: tc._id,
        passed,
        actualOutput: execResult.actualOutput,
        runtimeMs: execResult.runtimeMs,
      });

      totalTimeMs += execResult.runtimeMs;
      if (execResult.memoryKb > maxMemoryKb) maxMemoryKb = execResult.memoryKb;
    }

    const avgRuntime = testCases.length > 0 ? Math.round(totalTimeMs / testCases.length) : 0;
    const finalScore = testCases.length > 0 ? Math.round((passedCount / testCases.length) * 100) : 0;
    if (finalScore < 100 && overallStatus === 'Accepted') {
      overallStatus = 'WrongAnswer';
    }

    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        status: overallStatus,
        executionTimeMs: avgRuntime,
        memoryUsedKb: maxMemoryKb,
        testCaseResults: results,
        score: finalScore,
      },
      { new: true }
    );

    // Update Problem & User statistics
    await Problem.findByIdAndUpdate(problemId, {
      $inc: {
        'stats.totalSubmissions': 1,
        'stats.acceptedSubmissions': overallStatus === 'Accepted' ? 1 : 0,
      },
    });

    if (overallStatus === 'Accepted') {
      const user = await User.findById(userId);
      if (user) {
        user.stats.problemsSolved += 1;
        await user.save();
        await evaluateUserBadges(userId);
      }
    }

    // Emit Socket event to user
    const io = getIO();
    io.to(`user_${userId}`).emit('submission:statusUpdate', updatedSubmission);

    return updatedSubmission;
  } catch (error) {
    console.error('[Submission Worker Error]:', error.message);
    const errSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      { status: 'RuntimeError', score: 0 },
      { new: true }
    );
    const io = getIO();
    io.to(`user_${userId}`).emit('submission:statusUpdate', errSubmission);
  }
};

let worker = null;
try {
  const connection = redisService.getClient();
  if (connection) {
    worker = new Worker(
      'submissionEvaluationQueue',
      async (job) => {
        return await processSubmissionJob(job.data);
      },
      { connection }
    );
    console.log('[BullMQ Worker]: Submission worker listening');
  }
} catch (e) {
  console.warn('[BullMQ Worker]: Standalone worker setup skipped');
}

module.exports = { processSubmissionJob, worker };
