const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_codearena_2026',
    { expiresIn: '7d' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_codearena_2026',
    { expiresIn: '30d' }
  );
};

// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!name || !cleanEmail || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState < 1) {
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable. Please check MONGO_URI in Vercel environment settings.',
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address' });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: cleanEmail,
      password,
      role: ['student', 'trainer', 'recruiter', 'admin'].includes(role) ? role : 'student',
    });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token: accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      },
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState < 1) {
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable. Please check MONGO_URI in Vercel environment settings.',
      });
    }

    let user = await User.findOne({ email: cleanEmail }).select('+password');

    // Auto-create demo user on the fly if MongoDB Atlas is fresh/empty
    if (!user && cleanEmail.endsWith('@codearena.dev')) {
      const demoRole = cleanEmail.includes('trainer')
        ? 'trainer'
        : cleanEmail.includes('recruiter')
        ? 'recruiter'
        : cleanEmail.includes('admin')
        ? 'admin'
        : 'student';

      const demoName =
        demoRole === 'student'
          ? 'Alex Student'
          : demoRole === 'trainer'
          ? 'Prof. Alan Turing'
          : demoRole === 'recruiter'
          ? 'Rachel Recruiter'
          : 'System Admin';

      user = await User.create({
        name: demoName,
        email: cleanEmail,
        password: 'password123',
        role: demoRole,
      });
    }

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Account has been banned by an administrator' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          stats: user.stats,
        },
      },
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

// @route POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token missing' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_codearena_2026');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    res.json({
      success: true,
      data: { token: newAccessToken },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Expired or invalid refresh token' });
  }
};

// @route POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken && req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: refreshToken },
      });
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, logout };
