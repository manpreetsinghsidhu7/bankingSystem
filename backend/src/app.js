const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const globalErrorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

const logger = require('./utils/logger');

// 1. GLOBAL MIDDLEWARES
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Body parser

// Deep Request Tracer
app.use((req, res, next) => {
  logger.info(`[INCOMING] ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    // Sanitize passwords from logs!
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    logger.debug(`[BODY] ${JSON.stringify(sanitizedBody)}`);
  }
  
  // Intercept the response end to log completion
  const oldJson = res.json;
  res.json = function(data) {
    logger.info(`[OUTGOING] ${req.method} ${req.originalUrl} - STATUS ${res.statusCode}`);
    if (res.statusCode >= 400) {
      logger.error(`[ERROR RESPONSE] ${JSON.stringify(data)}`);
    } else {
      logger.debug(`[SUCCESS RESPONSE] ${JSON.stringify(data)}`);
    }
    return oldJson.apply(res, arguments);
  };
  next();
});

app.use(morgan('dev')); // Fallback request logging

// Limit requests from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// 2. ROUTES
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the VAYU Banking API! The backend is running perfectly.',
    documentation: 'Base API URL is /api/v1'
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/admin', adminRoutes);

// Handle unhandled routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 3. ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
