const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');

const getProblems = async (req, res, next) => {
  try {
    const { difficulty, tags, search, company, page = 1, limit = 20 } = req.query;
    const query = { isPublished: true };

    if (difficulty) query.difficulty = difficulty;
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (company) query.companies = { $in: [company] };
    if (search) query.title = { $regex: search, $options: 'i' };

    const count = await Problem.countDocuments(query);
    const problems = await Problem.find(query)
      .select('title slug difficulty tags companies stats createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        problems,
        page: Number(page),
        pages: Math.ceil(count / limit),
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProblemBySlug = async (req, res, next) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Fetch sample test cases to send to user
    const sampleTestCases = await TestCase.find({ problem: problem._id, type: 'sample' });

    res.json({
      success: true,
      data: {
        ...problem.toObject(),
        sampleTestCases,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createProblem = async (req, res, next) => {
  try {
    const { title, description, difficulty, tags, starterCode, examples, constraints, timeLimitMs, memoryLimitKb, companies } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await Problem.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Problem with this title already exists' });
    }

    const problem = await Problem.create({
      title,
      slug,
      description,
      difficulty,
      tags: tags || [],
      constraints: constraints || [],
      examples: examples || [],
      starterCode: starterCode || {},
      timeLimitMs: timeLimitMs || 2000,
      memoryLimitKb: memoryLimitKb || 128000,
      companies: companies || [],
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Problem created successfully', data: problem });
  } catch (error) {
    next(error);
  }
};

const addTestCases = async (req, res, next) => {
  try {
    const problemId = req.params.id;
    const { testCases } = req.body; // Array of { type, input, expectedOutput }

    if (!Array.isArray(testCases)) {
      return res.status(400).json({ success: false, message: 'testCases must be an array' });
    }

    const created = [];
    for (const tc of testCases) {
      const createdTc = await TestCase.create({
        problem: problemId,
        type: tc.type || 'public',
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isEdgeCase: tc.isEdgeCase || false,
      });
      created.push(createdTc);
    }

    res.status(201).json({ success: true, message: `${created.length} test cases added`, data: created });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProblems, getProblemBySlug, createProblem, addTestCases };
