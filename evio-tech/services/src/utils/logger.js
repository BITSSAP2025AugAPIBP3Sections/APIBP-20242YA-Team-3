const { createLogger, format, transports } = require('winston');
const { v4: uuidv4 } = require('uuid');

const jsonFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: jsonFormat,
  transports: [
    new transports.Console()
  ],
});

function requestLogger(req, res, next) {
  // set correlation id if not present
  if (!req.headers['x-request-id']) req.headers['x-request-id'] = uuidv4();
  const meta = { requestId: req.headers['x-request-id'], method: req.method, path: req.path };
  logger.info('Incoming request', meta);
  // attach logger to req for convenience
  req.logger = logger.child(meta);
  next();
}

module.exports = { logger, requestLogger };
