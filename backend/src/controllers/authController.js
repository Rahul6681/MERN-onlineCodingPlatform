const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

// In-memory fallback user store for zero-downtime authentication on Vercel
const inMemoryUsers = new Map();

// Seed initial demo users into memory store
const seedMemoryUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash('password123', salt);

  const demoAccounts = [
    { _id: 'mem_student', name: 'Alex Student', email: 'student@codearena.dev', password: hashedPass, role: 'student', stats: { problemsSolved: 124 } },
    { _id: 'mem_trainer', name: 'Prof. Alan Turing', email: 'trainer@codearena.dev', password: hashedPass, role: 'trainer', stats: { problemsSolved: 210 } },
    { _id: 'mem_recruiter', name: 'Rachel Recruiter', email: 'recruiter@codearena.dev', password: hashedPass, role: 'recruiter', stats: { problemsSolved: 0 } },
    { _id: 'mem_admin', name: 'System Admin', email: 'admin@codearena.dev', password: hashedPass, role: 'admin', stats: { problemsSolved: 500 } },
  ];

  for (const acc of demoAccounts) {
    if (!inMemoryUsers.has(acc.email)) {
      inMemoryUsers.set(acc.email, acc);
    }
  }
};
seedMemoryUsers();

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

    // Try MongoDB connection if available
    const mongoose = require('mongoose');
    let useMongo = mongoose.connection.readyState >= 1;

    if (!useMongo) {
      try {
        await Promise.race([
          connectDB(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 2500)),
        ]);
        useMongo = mongoose.connection.readyState >= 1;
      } catch (e) {
        useMongo = false;
      }
    }

    if (useMongo) {
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

      return res.status(201).json({
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
    }

    // In-Memory Fallback Registration
    if (inMemoryUsers.has(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = `mem_user_${Date.now()}`;
    const userRole = ['student', 'trainer', 'recruiter', 'admin'].includes(role) ? role : 'student';

    const memUser = {
      _id: userId,
      name: String(name).trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: userRole,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
      stats: { problemsSolved: 0 },
    };

    inMemoryUsers.set(cleanEmail, memUser);

    const accessToken = generateAccessToken(userId, userRole);
    const refreshToken = generateRefreshToken(userId);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token: accessToken,
        user: {
          id: userId,
          name: memUser.name,
          email: memUser.email,
          role: memUser.role,
          avatarUrl: memUser.avatarUrl,
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

    // Try MongoDB connection if available
    const mongoose = require('mongoose');
    let useMongo = mongoose.connection.readyState >= 1;

    if (!useMongo) {
      try {
        await Promise.race([
          connectDB(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 2500)),
        ]);
        useMongo = mongoose.connection.readyState >= 1;
      } catch (e) {
        useMongo = false;
      }
    }

    if (useMongo) {
      let user = await User.findOne({ email: cleanEmail }).select('+password');

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

      if (user && (await user.matchPassword(password))) {
        if (user.isBanned) {
          return res.status(403).json({ success: false, message: 'Account has been banned by an administrator' });
        }

        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshTokens.push(refreshToken);
        await user.save();

        return res.json({
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
      }
    }

    // In-Memory Fallback Login
    let memUser = inMemoryUsers.get(cleanEmail);

    if (!memUser && cleanEmail.endsWith('@codearena.dev')) {
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

      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash('password123', salt);

      memUser = {
        _id: `mem_${demoRole}`,
        name: demoName,
        email: cleanEmail,
        password: hashedPass,
        role: demoRole,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(demoName)}`,
        stats: { problemsSolved: 100 },
      };
      inMemoryUsers.set(cleanEmail, memUser);
    }

    if (!memUser || !(await bcrypt.compare(password, memUser.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(memUser._id, memUser.role);
    const refreshToken = generateRefreshToken(memUser._id);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: accessToken,
        user: {
          id: memUser._id,
          name: memUser.name,
          email: memUser.email,
          role: memUser.role,
          avatarUrl: memUser.avatarUrl,
          stats: memUser.stats,
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
    const newAccessToken = generateAccessToken(decoded.id, 'student');

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
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, logout };
