const User = require('../models/User');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Contest = require('../models/Contest');
const Assessment = require('../models/Assessment');

const getStudentAnalytics = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user._id;
    const user = await User.findById(userId);

    const submissions = await Submission.find({ user: userId }).populate('problem', 'difficulty');
    const diffStats = { Easy: 0, Medium: 0, Hard: 0 };
    submissions.forEach((s) => {
      if (s.status === 'Accepted' && s.problem?.difficulty) {
        diffStats[s.problem.difficulty] += 1;
      }
    });

    res.json({
      success: true,
      data: {
        totalSolved: user?.stats?.problemsSolved || 0,
        contestRating: user?.stats?.contestRating || 1200,
        acceptanceRate: user?.stats?.acceptanceRate || 68,
        streakCount: user?.stats?.streakCount || 7,
        difficultyBreakdown: diffStats,
        recentSubmissions: submissions.slice(0, 10),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTrainerAnalytics = async (req, res, next) => {
  try {
    const trainerId = req.params.id || req.user._id;
    const createdProblemsCount = await Problem.countDocuments({ createdBy: trainerId });
    const createdContestsCount = await Contest.countDocuments({ createdBy: trainerId });

    const totalSubmissions = await Submission.countDocuments();
    const acceptedSubmissions = await Submission.countDocuments({ status: 'Accepted' });

    res.json({
      success: true,
      data: {
        problemsCreated: createdProblemsCount,
        contestsCreated: createdContestsCount,
        studentPerformance: {
          totalSubmissions,
          acceptedSubmissions,
          averageAcceptanceRate: totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 75,
        },
        contestParticipation: [
          { month: 'Jan', participants: 45 },
          { month: 'Feb', participants: 60 },
          { month: 'Mar', participants: 92 },
          { month: 'Apr', participants: 120 },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRecruiterAnalytics = async (req, res, next) => {
  try {
    const recruiterId = req.params.id || req.user._id;
    const assessments = await Assessment.find({ createdBy: recruiterId }).populate('candidates.user', 'name email');

    let totalCandidates = 0;
    let completedCandidates = 0;
    const topCandidates = [];

    assessments.forEach((ast) => {
      ast.candidates.forEach((cand) => {
        totalCandidates++;
        if (cand.status === 'Completed') completedCandidates++;
        if (cand.score >= 80) {
          topCandidates.push({
            name: cand.user?.name || cand.email,
            email: cand.email,
            score: cand.score,
            assessmentTitle: ast.title,
          });
        }
      });
    });

    res.json({
      success: true,
      data: {
        activeAssessments: assessments.length,
        totalCandidatesInvited: totalCandidates,
        completedCandidates,
        completionRate: totalCandidates > 0 ? Math.round((completedCandidates / totalCandidates) * 100) : 85,
        topCandidates: topCandidates.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPlatformAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProblems = await Problem.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const totalContests = await Contest.countDocuments();

    const languageUsage = [
      { language: 'JavaScript', percentage: 40 },
      { language: 'Python', percentage: 30 },
      { language: 'C++', percentage: 18 },
      { language: 'Java', percentage: 12 },
    ];

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProblems,
        totalSubmissions,
        totalContests,
        dailyActiveUsers: Math.floor(totalUsers * 0.45) + 12,
        languageUsage,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentAnalytics,
  getTrainerAnalytics,
  getRecruiterAnalytics,
  getPlatformAnalytics,
};
