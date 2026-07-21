const aiService = require('../services/aiService');
const Problem = require('../models/Problem');

const getHint = async (req, res, next) => {
  try {
    const { problemId, code, language } = req.body;
    const problem = await Problem.findById(problemId);
    const result = await aiService.getAiHint({
      problemTitle: problem ? problem.title : 'Coding Problem',
      description: problem ? problem.description : '',
      code,
      language,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getReview = async (req, res, next) => {
  try {
    const { problemId, code, language } = req.body;
    const problem = await Problem.findById(problemId);
    const result = await aiService.getAiCodeReview({
      code,
      language,
      problemTitle: problem ? problem.title : 'Solution',
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getComplexity = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    const result = await aiService.getAiComplexity({ code, language });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getDebug = async (req, res, next) => {
  try {
    const { code, language, errorOutput } = req.body;
    const result = await aiService.getAiDebug({ code, language, errorOutput });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getRecommend = async (req, res, next) => {
  try {
    const { weakTags } = req.body;
    const result = await aiService.getAiRecommend({ weakTags, solvedCount: req.user.stats?.problemsSolved });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHint, getReview, getComplexity, getDebug, getRecommend };
