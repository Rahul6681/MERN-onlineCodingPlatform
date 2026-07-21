const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  const rawUri = process.env.MONGO_URI;
  const mongoUri = rawUri ? rawUri.trim().replace(/^["']|["']$/g, '') : 'mongodb://localhost:27017/codearena';

  try {
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
