const mongoose = require('mongoose');
const dns = require('dns');

// Ensure reliable DNS resolution for mongodb+srv:// URIs in serverless environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  const rawUri = process.env.MONGO_URI;
  let mongoUri = rawUri ? String(rawUri).trim().replace(/^["']|["']$/g, '') : 'mongodb://localhost:27017/codearena';
  
  // Fix common user typos in Vercel environment variables (like double slash in path)
  mongoUri = mongoUri.replace('.net//', '.net/');

  try {
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Reduced to 10s so Vercel doesn't timeout the whole function
    });
    isConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // DO NOT THROW HERE. Throwing causes UnhandledPromiseRejection on Vercel which kills the Serverless container.
    // The authController will handle the fallback automatically if readyState is not 1.
  }
};

module.exports = connectDB;
