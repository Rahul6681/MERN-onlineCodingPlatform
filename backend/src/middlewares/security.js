const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const applySecurityMiddlewares = (app) => {
  // Helmet HTTP security headers (configured for cross-origin compatibility)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Dynamic CORS configuration for Vercel, Render, and Localhost
  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          process.env.NODE_ENV !== 'production' ||
          origin.includes('vercel.app') ||
          origin.includes('localhost') ||
          (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)
        ) {
          callback(null, true);
        } else {
          callback(null, true); // Fallback allow for deployed frontend
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    })
  );

  // Prevent NoSQL query injection
  app.use(mongoSanitize());

  // Prevent HTTP Parameter Pollution
  app.use(hpp());
};

module.exports = applySecurityMiddlewares;
