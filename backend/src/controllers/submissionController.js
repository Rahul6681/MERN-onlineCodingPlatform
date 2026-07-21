const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const { executeCode } = require('../services/judge0Service');
const { addSubmissionJob } = require('../jobs/submissionQueue');
const { processSubmissionJob } = require('../jobs/submissionWorker');

// @route POST /api/submissions/run (Synchronous sample test run)
const runCode = async (req, res, next) => {
  try {
    const { problemId, language, code, input } = req.body;

    const sampleTestCase = input
      ? { input, expectedOutput: '' }
      : await TestCase.findOne({ problem: problemId, type: 'sample' });

    const execResult = await executeCode({
      code,
      language,
      input: sampleTestCase ? sampleTestCase.input : '',
      expectedOutput: sampleTestCase ? sampleTestCase.expectedOutput : '',
    });

    res.json({
      success: true,
      data: {
        status: execResult.status,
        passed: execResult.passed,
        stdout: execResult.actualOutput,
        runtimeMs: execResult.runtimeMs,
        memoryKb: execResult.memoryKb,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/submissions/submit (Asynchronous / Synchronous fallback full test suite submission)
const submitCode = async (req, res, next) => {
  try {
    const { problemId, language, code, contestId } = req.body;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const submission = await Submission.create({
      user: req.user._id,
      problem: problemId,
      contest: contestId || null,
      language,
      code,
      status: 'Pending',
    });

    // Evaluate submission immediately
    const evaluatedSubmission = await processSubmissionJob({
      submissionId: submission._id,
      userId: req.user._id,
      problemId,
      code,
      language,
    });

    const finalResult = evaluatedSubmission || (await Submission.findById(submission._id));

    res.status(200).json({
      success: true,
      message: 'Submission evaluated successfully',
      data: finalResult,
    });
  } catch (error) {
    next(error);
  }
};

const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('problem', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, data: submissions });
  } catch (error) {
    next(error);
  }
};

const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problem', 'title slug difficulty starterCode')
      .populate('user', 'name avatarUrl');
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    res.json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};

module.exports = { runCode, submitCode, getMySubmissions, getSubmissionById };
