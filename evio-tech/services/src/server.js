const http = require('http');
const app = require('./app');
const connectDb = require('./config/db');
const { logger } = require('./utils/logger');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDb();
    const server = http.createServer(app);
    server.listen(PORT, () => {
      logger.info(`Services module listening on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

start();
