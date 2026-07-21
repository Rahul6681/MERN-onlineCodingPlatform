const LearningPath = require('../models/LearningPath');

const getLearningPaths = async (req, res, next) => {
  try {
    const paths = await LearningPath.find().populate('problems.problem', 'title slug difficulty tags');
    res.json({ success: true, data: paths });
  } catch (error) {
    next(error);
  }
};

const getLearningPathById = async (req, res, next) => {
  try {
    const path = await LearningPath.findById(req.params.id).populate('problems.problem', 'title slug difficulty tags starterCode');
    if (!path) {
      return res.status(404).json({ success: false, message: 'Learning path not found' });
    }
    res.json({ success: true, data: path });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLearningPaths, getLearningPathById };
