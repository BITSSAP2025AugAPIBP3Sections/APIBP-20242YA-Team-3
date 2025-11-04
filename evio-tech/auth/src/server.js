require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

const server = app.listen(PORT, () => {
  logger.info(`Auth service listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

module.exports = server;