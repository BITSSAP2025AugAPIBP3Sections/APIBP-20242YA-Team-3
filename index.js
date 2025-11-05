const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger/swagger.js');
const { router: serviceRouter } = require('./service-module/service-module');
const { router: billingRouter } = require('./billing-module/billing-module');
const { router: paymentRouter } = require('./payments-module/payments-module');
const { router: authRouter } = require('./auth-module/auth-module');
const { access: accessLogger, error: errorLogger, debug: debugLogger, log4js } = require('./config/logger');

const app = express();
const PORT = 3000;

// Log uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
    errorLogger.fatal('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    errorLogger.fatal('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start-up logging
debugLogger.debug('Starting service management API...');
debugLogger.debug('Initializing middleware...');

// Middleware to parse JSON bodies
app.use(express.json());

// Add logging middleware
app.use(log4js.connectLogger(accessLogger, {
    level: 'info',
    format: (req, res, format) => format(`:remote-addr - ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"`)
}));

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Use the service, billing, payment, and auth routes
app.use('/api', serviceRouter);
app.use('/api', billingRouter);
app.use('/api', paymentRouter);
app.use('/api', authRouter);

// Add basic error handling
app.use((err, req, res, next) => {
    errorLogger.error('Error:', err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Start the server
app.listen(PORT, () => {
    accessLogger.info(`Server is running on http://localhost:${PORT}`);
    debugLogger.debug('Server startup complete');
});
