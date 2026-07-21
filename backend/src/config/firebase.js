const admin = require('firebase-admin');

let firebaseApp = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('[Firebase]: Admin SDK initialized');
  } catch (err) {
    console.warn('[Firebase]: Initialization failed:', err.message);
  }
}

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!firebaseApp || !fcmToken) {
    console.log(`[Firebase Push Mock]: To (${fcmToken || 'NoToken'}): ${title} - ${body}`);
    return { success: true, mocked: true };
  }
  try {
    const response = await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data,
    });
    return { success: true, messageId: response };
  } catch (error) {
    console.error('[Firebase Push Error]:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { firebaseApp, sendPushNotification };
