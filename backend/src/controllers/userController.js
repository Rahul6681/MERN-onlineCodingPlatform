const User = require('../models/User');

const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const { university, skills, githubProfile, bio, languagesKnown } = req.body;
    const user = await User.findById(req.user._id);

    if (university !== undefined) user.profile.university = university;
    if (skills !== undefined) user.profile.skills = skills;
    if (githubProfile !== undefined) user.profile.githubProfile = githubProfile;
    if (bio !== undefined) user.profile.bio = bio;
    if (languagesKnown !== undefined) user.profile.languagesKnown = languagesKnown;

    await user.save();
    res.json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('-refreshTokens');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const getAllUsersAdmin = async (req, res, next) => {
  try {
    const users = await User.find().select('-refreshTokens').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const toggleUserBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ success: true, message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfile, updateMyProfile, getUserById, getAllUsersAdmin, toggleUserBan };
