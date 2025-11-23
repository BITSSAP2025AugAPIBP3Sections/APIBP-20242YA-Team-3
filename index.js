const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./src/config/swagger.js');
const { ApolloServer } = require('apollo-server-express');
const { router: serviceRouter, typeDefs, resolvers, initializeDB } = require('./src/controllers/service.controller');
const { router: billingRouter } = require('./src/controllers/billing.controller');
const { router: paymentRouter } = require('./src/controllers/payment.controller');
const { router: authRouter } = require('./src/controllers/auth.controller');
const { router: notificationRouter, initializeNotificationsFile } = require('./src/controllers/notification.controller');
const { access: accessLogger, error: errorLogger, debug: debugLogger, log4js } = require('./src/utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

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
        
        // Security middleware
        // Helmet for security headers
        app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                    scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers
                    imgSrc: ["'self'", "data:", "https:"],
                }
            },
            crossOriginEmbedderPolicy: false
        }));
        
        // CORS configuration
        const corsOptions = {
            origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
            maxAge: 86400 // 24 hours
        };
        app.use(cors(corsOptions));
        
        // Rate limiting for API routes
        const apiLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });
        
        // Stricter rate limiting for auth routes
        const authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // Limit each IP to 5 login attempts per windowMs
            message: 'Too many login attempts, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });
        
        // Apply rate limiting to API routes
        app.use('/api', apiLimiter);
        app.use('/api/v1/login', authLimiter);
        
        debugLogger.debug('Security middleware initialized (Helmet, CORS, Rate Limiting)');
        
        // THEN apply other middleware and routes
        // Middleware to parse JSON bodies
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cookieParser()); // Parse cookies

        // Serve static files from public directory
        app.use(express.static(path.join(__dirname, 'public')));

        // Protect admin pages with JWT authentication and admin role check
        // Checks token from cookie (set by frontend) or Authorization header
        app.use('/pages/admin/*', async (req, res, next) => {
            // Try to get token from cookie first, then Authorization header
            let token = req.cookies.authToken;
            
            if (!token) {
                const authHeader = req.headers['authorization'];
                token = authHeader && authHeader.split(' ')[1];
            }

            if (!token) {
                return res.status(401).send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Unauthorized</title>
                        <script>
                            // Redirect to login after 2 seconds
                            setTimeout(() => {
                                window.location.href = '/pages/auth/login.html';
                            }, 2000);
                        </script>
                    </head>
                    <body>
                        <h1>401 - Unauthorized</h1>
                        <p>Please login to access admin dashboard.</p>
                        <p>Redirecting to login page...</p>
                    </body>
                    </html>
                `);
            }

            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
                
                // Check if user has admin role
                if (decoded.role !== 'admin') {
                    return res.status(403).send(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Forbidden</title>
                            <script>
                                // Redirect to regular dashboard after 2 seconds
                                setTimeout(() => {
                                    window.location.href = '/pages/dashboard/index.html';
                                }, 2000);
                            </script>
                        </head>
                        <body>
                            <h1>403 - Forbidden</h1>
                            <p>Admin privileges required.</p>
                            <p>Redirecting to dashboard...</p>
                        </body>
                        </html>
                    `);
                }

                // User is authenticated and has admin role
                req.user = decoded; // Attach user info to request
                next();
            } catch (err) {
                return res.status(403).send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Invalid Token</title>
                        <script>
                            // Clear invalid token and redirect
                            document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                            localStorage.removeItem('authToken');
                            setTimeout(() => {
                                window.location.href = '/pages/auth/login.html';
                            }, 2000);
                        </script>
                    </head>
                    <body>
                        <h1>403 - Invalid or Expired Token</h1>
                        <p>Your session has expired.</p>
                        <p>Redirecting to login page...</p>
                    </body>
                    </html>
                `);
            }
        });

        // Add logging middleware
        app.use(log4js.connectLogger(accessLogger, {
            level: 'info',
            format: (req, res, format) => format(`:remote-addr - ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"`)
        }));

        // Swagger UI route
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

        // Root route - check login and redirect
        app.get('/', (req, res) => {
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Evio-Tech</title>
                    <meta http-equiv="refresh" content="0; url=/index.html">
                </head>
                <body>
                    <script>
                        // Check if user is logged in
                        const tenant = localStorage.getItem('tenant');
                        if (tenant) {
                            window.location.href = '/pages/dashboard/index.html';
                        } else {
                            window.location.href = '/index.html';
                        }
                    </script>
                </body>
                </html>
            `);
        });

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
