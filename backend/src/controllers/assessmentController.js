const Assessment = require('../models/Assessment');
const { sendEmail } = require('../config/mailer');

const createAssessment = async (req, res, next) => {
  try {
    const { title, problems, durationMinutes, proctoringEnabled, randomizeQuestions } = req.body;

    const assessment = await Assessment.create({
      title,
      createdBy: req.user._id,
      problems: problems || [],
      durationMinutes: durationMinutes || 60,
      proctoringEnabled: proctoringEnabled ?? true,
      randomizeQuestions: randomizeQuestions ?? true,
    });

    res.status(201).json({ success: true, message: 'Assessment created', data: assessment });
  } catch (error) {
    next(error);
  }
};

const inviteCandidates = async (req, res, next) => {
  try {
    const { emails } = req.body; // Array of emails
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const invitedList = [];
    for (const email of emails) {
      const existing = assessment.candidates.find((c) => c.email === email);
      if (!existing) {
        assessment.candidates.push({ email, status: 'Invited' });
        invitedList.push(email);
        await sendEmail({
          to: email,
          subject: `Coding Assessment Invitation: ${assessment.title}`,
          text: `You have been invited to take a coding assessment: ${assessment.title}. Please login to CodeArena to take the test.`,
        });
      }
    }

    await assessment.save();
    res.json({ success: true, message: `${invitedList.length} candidates invited`, data: assessment });
  } catch (error) {
    next(error);
  }
};

const getAssessmentResults = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('problems', 'title difficulty')
      .populate('candidates.user', 'name email avatarUrl');

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    res.json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
};

const logProctoringEvent = async (req, res, next) => {
  try {
    const { eventType } = req.body; // 'tab_switch', 'copy_paste'
    const assessment = await Assessment.findById(req.params.id);

    if (assessment && req.user) {
      const candidate = assessment.candidates.find((c) => c.email === req.user.email || c.user?.toString() === req.user._id.toString());
      if (candidate) {
        candidate.proctoringFlags.push(`${eventType} at ${new Date().toISOString()}`);
        await assessment.save();
      }
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAssessment, inviteCandidates, getAssessmentResults, logProctoringEvent };
