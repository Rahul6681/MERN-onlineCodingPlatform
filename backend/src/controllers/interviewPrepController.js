const Problem = require('../models/Problem');

// @route GET /api/interview-prep/companies
const getCompanyProblems = async (req, res, next) => {
  try {
    const { company } = req.query; // e.g. Amazon, Google, Microsoft, Meta
    const query = { isPublished: true };
    if (company) {
      query.companies = { $in: [company] };
    } else {
      query.companies = { $exists: true, $not: { $size: 0 } };
    }

    const problems = await Problem.find(query)
      .select('title slug difficulty tags companies stats')
      .sort({ 'stats.totalSubmissions': -1 });

    const companyStats = {
      Amazon: await Problem.countDocuments({ companies: 'Amazon' }),
      Google: await Problem.countDocuments({ companies: 'Google' }),
      Microsoft: await Problem.countDocuments({ companies: 'Microsoft' }),
      Meta: await Problem.countDocuments({ companies: 'Meta' }),
    };

    res.json({
      success: true,
      data: {
        companyStats,
        problems,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/interview-prep/patterns
const getCodingPatterns = async (req, res, next) => {
  try {
    const patterns = [
      {
        id: 'sliding-window',
        name: 'Sliding Window',
        description: 'Used for array/string problems involving contiguous subarrays/substrings.',
        tags: ['Sliding Window', 'Two Pointers'],
        count: await Problem.countDocuments({ tags: { $in: ['Sliding Window', 'Arrays'] } }),
      },
      {
        id: 'two-pointers',
        name: 'Two Pointers',
        description: 'Iterate with two references to search pairs or subarrays in linear time.',
        tags: ['Two Pointers'],
        count: await Problem.countDocuments({ tags: 'Two Pointers' }),
      },
      {
        id: 'fast-slow-pointers',
        name: 'Fast & Slow Pointers (Floyd Cycle)',
        description: 'Detect cycles in Linked Lists and Arrays.',
        tags: ['LinkedList', 'Two Pointers'],
        count: await Problem.countDocuments({ tags: 'LinkedList' }),
      },
      {
        id: 'merge-intervals',
        name: 'Merge Intervals',
        description: 'Overlapping interval problems and scheduling optimization.',
        tags: ['Intervals', 'Sorting'],
        count: await Problem.countDocuments({ tags: 'Intervals' }),
      },
      {
        id: 'top-k-elements',
        name: 'Top K Elements (Heap / Priority Queue)',
        description: 'Find max, min, or top K frequent elements using heaps.',
        tags: ['Heap', 'Priority Queue'],
        count: await Problem.countDocuments({ tags: 'Heap' }),
      },
    ];

    res.json({ success: true, data: patterns });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/interview-prep/mock-assessment
const createMockAssessment = async (req, res, next) => {
  try {
    const { company, durationMinutes = 45 } = req.body;
    const query = company ? { companies: company } : {};

    const problems = await Problem.aggregate([
      { $match: { isPublished: true, ...query } },
      { $sample: { size: 2 } },
    ]);

    res.json({
      success: true,
      message: 'Private Mock Assessment generated',
      data: {
        sessionToken: `mock_${Date.now()}_${req.user._id}`,
        durationMinutes,
        problems,
        startTime: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCompanyProblems, getCodingPatterns, createMockAssessment };
