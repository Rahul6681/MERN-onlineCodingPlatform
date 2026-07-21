const connectDB = require('../backend/src/config/db');
const { app } = require('../backend/src/server');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless DB Error]:', err.message);
  }
  return app(req, res);
};
