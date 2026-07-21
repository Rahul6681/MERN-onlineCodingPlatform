const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['ContestStarted', 'SubmissionAccepted', 'NewProblemAdded', 'BadgeEarned'],
      required: true,
    },
    message: { type: String, required: true },
    channel: { type: String, enum: ['email', 'push', 'inApp'], default: 'inApp' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
