const Notification = require('../models/Notification');
const { sendEmail } = require('../config/mailer');
const { sendPushNotification } = require('../config/firebase');
const { getIO } = require('../config/socket');

const dispatchNotification = async ({ userId, type, message, emailTo, fcmToken, channel = 'inApp' }) => {
  try {
    // 1. In-App Notification
    const notif = await Notification.create({
      user: userId,
      type,
      message,
      channel,
    });

    // 2. Real-Time Socket Push
    const io = getIO();
    io.to(`user_${userId}`).emit('notification:new', notif);

    // 3. Email dispatch if email channel requested
    if (channel === 'email' && emailTo) {
      await sendEmail({
        to: emailTo,
        subject: `CodeArena Notification: ${type}`,
        text: message,
        html: `<div style="font-family: sans-serif; padding: 20px;"><h2>CodeArena Alert</h2><p>${message}</p></div>`,
      });
    }

    // 4. Push notification via Firebase
    if (channel === 'push' && fcmToken) {
      await sendPushNotification(fcmToken, `CodeArena: ${type}`, message);
    }

    return notif;
  } catch (error) {
    console.error('[Notification Dispatch Error]:', error.message);
  }
};

module.exports = { dispatchNotification };
