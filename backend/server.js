require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

logger.info('--- INITIALIZING BACKEND SERVER ---');
logger.debug(`Environment Loaded: PORT=${PORT}, SUPABASE_URL=${process.env.SUPABASE_URL ? 'PRESENT' : 'MISSING'}`);

// Handle uncaught exceptions synchronously
process.on('uncaughtException', (err) => {
  logger.error('CRITICAL: UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message, err.stack);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  logger.info(`✅ Server is RUNNING dynamically on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`❌ PORT ${PORT} IS ALREADY IN USE. Another node process is running!`);
  } else {
    logger.error(`❌ SERVER ERROR: ${err.message}`, err);
  }
});

// Handle unhandled promise rejections asynchronously
process.on('unhandledRejection', (err) => {
  logger.error('CRITICAL: UNHANDLED REJECTION! 💥 Shutting down gracefully...');
  logger.error(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});
