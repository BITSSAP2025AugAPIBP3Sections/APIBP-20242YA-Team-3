const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
module.exports = (req, res, next) => {
  req.logger = logger;
  next();
};

