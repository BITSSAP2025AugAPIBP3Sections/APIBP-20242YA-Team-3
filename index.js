const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger/swagger.js');
const { ApolloServer } = require('apollo-server-express');
const { router: serviceRouter, typeDefs, resolvers, initializeDB } = require('./service-module/service-module');
const { router: billingRouter } = require('./billing-module/billing-module');
const { router: paymentRouter } = require('./payments-module/payments-module');
const { router: authRouter } = require('./auth-module/auth-module');
const { router: notificationRouter, initializeNotificationsFile } = require('./notification-module/notification-module');
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

// Initialize GraphQL Apollo Server and start server
async function startServer() {
    try {
        // Initialize Apollo Server BEFORE any other middleware
        const apolloServer = new ApolloServer({
            typeDefs,
            resolvers,
            introspection: true
        });
        
        await apolloServer.start();
        
        // Apply Apollo Server middleware first
        apolloServer.applyMiddleware({ app, path: '/graphql' });
        
        debugLogger.debug('GraphQL Apollo Server initialized');
        
        // THEN apply other middleware and routes
        // Middleware to parse JSON bodies
        app.use(express.json());

        // Add logging middleware
        app.use(log4js.connectLogger(accessLogger, {
            level: 'info',
            format: (req, res, format) => format(`:remote-addr - ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"`)
        }));

        // Swagger UI route
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

        // Use the service, billing, payment, auth, and notification routes
        app.use('/api', serviceRouter);
        app.use('/api', billingRouter);
        app.use('/api', paymentRouter);
        app.use('/api', authRouter);
        app.use('/api', notificationRouter);

        // Add error handling
        app.use((err, req, res, next) => {
            errorLogger.error('Error:', err.stack);
            res.status(500).json({ error: 'Something broke!' });
        });
        
        // Start the express server
        const server = app.listen(PORT, async () => {
            accessLogger.info(`Server is running on http://localhost:${PORT}`);
            accessLogger.info(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
            accessLogger.info(`REST API documentation: http://localhost:${PORT}/api-docs`);
            debugLogger.debug('Server startup complete');
            
            // Initialize MongoDB connection
            try {
                await initializeDB();
                accessLogger.info('MongoDB connection initialized');
            } catch (error) {
                errorLogger.error('Error initializing MongoDB:', error);
            }
            
            // Initialize notifications file
            try {
                await initializeNotificationsFile();
                accessLogger.info('Notifications system initialized');
            } catch (error) {
                errorLogger.error('Error initializing notifications:', error);
            }
            
            accessLogger.info('GraphQL introspection enabled');
        });
        
        // Graceful shutdown
        process.on('SIGTERM', async () => {
            debugLogger.info('SIGTERM received, shutting down gracefully...');
            
            try {
                server.close(async () => {
                    accessLogger.info('Server closed');
                    process.exit(0);
                });
            } catch (error) {
                errorLogger.fatal('Error during shutdown:', error);
                process.exit(1);
            }
        });
    } catch (error) {
        errorLogger.error('Error initializing Apollo Server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();
