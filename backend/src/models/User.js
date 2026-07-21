const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['student', 'trainer', 'recruiter', 'admin'], default: 'student' },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String },
    avatarUrl: { type: String, default: 'https://via.placeholder.com/150' },
    profile: {
      university: { type: String, default: '' },
      skills: [{ type: String }],
      githubProfile: { type: String, default: '' },
      bio: { type: String, default: '' },
      languagesKnown: [{ type: String }],
    },
    stats: {
      problemsSolved: { type: Number, default: 0 },
      contestRating: { type: Number, default: 1200 },
      globalRank: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 0 },
      streakCount: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
    },
    isVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    refreshTokens: [{ type: String }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
