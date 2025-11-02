require('dotenv').config();
const express = require('express');
require('express-async-errors'); // handle async errors
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { logger, requestLogger } = require('./utils/logger');
const companyRoutes = require('./routes/company.routes');
const consumerRoutes = require('./routes/consumer.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);           // put our winston logger early
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// API routes (segmented)
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/consumer', consumerRoutes);

// health
app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV || 'dev' }));

// generic error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
