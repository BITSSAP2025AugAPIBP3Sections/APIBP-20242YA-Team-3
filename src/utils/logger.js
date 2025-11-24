const log4js = require('log4js');

log4js.configure({
    appenders: {
        console: { type: 'console' },
        accessLog: { type: 'dateFile', filename: 'logs/access.log', pattern: '.yyyy-MM-dd' },
        errorLog: { type: 'dateFile', filename: 'logs/error.log', pattern: '.yyyy-MM-dd' },
        debug: { type: 'dateFile', filename: 'logs/debug.log', pattern: '.yyyy-MM-dd' }
    },
    categories: {
        default: { appenders: ['console', 'debug'], level: 'debug' },
        access: { appenders: ['console', 'accessLog'], level: 'info' },
        error: { appenders: ['console', 'errorLog'], level: 'error' }
    }
});

// Create loggers
const accessLogger = log4js.getLogger('access');
const errorLogger = log4js.getLogger('error');
const debugLogger = log4js.getLogger('default');

module.exports = {
    access: accessLogger,
    error: errorLogger,
    debug: debugLogger,
    log4js: log4js
};
