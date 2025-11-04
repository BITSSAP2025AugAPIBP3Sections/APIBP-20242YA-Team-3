const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('express-async-errors');
const { v4: uuidv4 } = require('uuid');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const logger = require('./utils/logger');

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger/auth.yaml'));

// Create Express app
const app = express();

// Basic middleware
app.use(helmet({
  contentSecurityPolicy: false // This is needed for Swagger UI to work properly
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Add request ID to each request
app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "EVIO Auth Service API Documentation"
}));

// API routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/kyc', require('./routes/kyc.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    requestId: req.id
  });

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      requestId: req.id
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Resource not found',
      requestId: req.id
    }
  });
});

module.exports = app;