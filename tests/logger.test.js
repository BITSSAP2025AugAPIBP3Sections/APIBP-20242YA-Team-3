const logger = require('../src/utils/logger');

describe('Logger Utility', () => {
    test('should export access logger', () => {
        expect(logger.access).toBeDefined();
        expect(typeof logger.access.info).toBe('function');
    });

    test('should export error logger', () => {
        expect(logger.error).toBeDefined();
        expect(typeof logger.error.error).toBe('function');
    });

    test('should export debug logger', () => {
        expect(logger.debug).toBeDefined();
        expect(typeof logger.debug.debug).toBe('function');
    });

    test('should export log4js instance', () => {
        expect(logger.log4js).toBeDefined();
        expect(typeof logger.log4js.configure).toBe('function');
    });

    test('loggers should have required methods', () => {
        // Check if loggers have common logging methods
        expect(typeof logger.access.info).toBe('function');
        expect(typeof logger.error.error).toBe('function');
        expect(typeof logger.debug.debug).toBe('function');
        expect(typeof logger.debug.info).toBe('function');
    });
});
