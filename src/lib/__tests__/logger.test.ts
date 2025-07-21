import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

const mockWindow = {
  ENABLE_DEBUG: vi.fn(),
  DISABLE_DEBUG: vi.fn(),
  IS_DEBUG_ENABLED: vi.fn(),
  __LOGGER_CONFIG__: { enabled: true, level: 'debug' },
  __LOGGER_INITIALIZED__: true,
};

const originalEnv = process.env;

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    // Mock console methods
    Object.defineProperty(global, 'console', {
      value: mockConsole,
      writable: true,
    });

    // Mock window object
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
    });

    process.env = { ...originalEnv, NODE_ENV: 'test' };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = originalEnv;
  });

  describe('Logger class', () => {
    it('should create logger with default prefix', async () => {
      const { Logger } = await import('@/lib/logger');
      const logger = new Logger();
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should create logger with custom prefix', async () => {
      const { Logger } = await import('@/lib/logger');
      const logger = new Logger('TestApp');
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should log debug messages when debug is enabled', async () => {
      const { Logger } = await import('@/lib/logger');
      const logger = new Logger('TestApp');
      logger.debug('Test debug message');
      expect(mockConsole.log).toHaveBeenCalledWith(
        '[TestApp] DEBUG:',
        'Test debug message'
      );
    });

    it('should log info messages', async () => {
      const { Logger } = await import('@/lib/logger');
      const logger = new Logger('TestApp');
      logger.info('Test info message');
      expect(mockConsole.info).toHaveBeenCalledWith(
        '[TestApp] INFO:',
        'Test info message'
      );
    });

    it('should log warn messages', async () => {
      const { Logger } = await import('@/lib/logger');
      const logger = new Logger('TestApp');
      logger.warn('Test warn message');
      expect(mockConsole.warn).toHaveBeenCalledWith(
        '[TestApp] WARN:',
        'Test warn message'
      );
    });

    it('should log error messages', async () => {
      const { Logger } = await import('@/lib/logger');
      const logger = new Logger('TestApp');
      logger.error('Test error message');
      expect(mockConsole.error).toHaveBeenCalledWith(
        '[TestApp] ERROR:',
        'Test error message'
      );
    });

    it('should log error messages with objects', async () => {
      const { Logger } = await import('@/lib/logger');
      const logger = new Logger('TestApp');
      const errorObj = { code: 'TEST_ERROR', message: 'Test error' };
      logger.error('Test error message', errorObj);
      expect(mockConsole.error).toHaveBeenCalledWith(
        '[TestApp] ERROR:',
        'Test error message',
        errorObj
      );
    });
  });

  describe('Global functions', () => {
    it('should enable debug logging', async () => {
      const { enableDebug } = await import('@/lib/logger');
      enableDebug('info');
      expect(mockWindow.ENABLE_DEBUG).toHaveBeenCalledWith('info');
    });

    it('should disable debug logging', async () => {
      const { disableDebug } = await import('@/lib/logger');
      disableDebug();
      expect(mockWindow.DISABLE_DEBUG).toHaveBeenCalled();
    });

    it('should check if debug is enabled', async () => {
      const { isDebugEnabled } = await import('@/lib/logger');
      const result = isDebugEnabled();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Logger configuration', () => {
    it('should respect debug level configuration', async () => {
      // Set debug level to warn (should not log debug or info)
      mockWindow.__LOGGER_CONFIG__ = { enabled: true, level: 'warn' };

      const { Logger } = await import('@/lib/logger');
      const logger = new Logger('TestApp');

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(mockConsole.log).not.toHaveBeenCalled(); // debug uses console.log
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalledWith(
        '[TestApp] WARN:',
        'Warn message'
      );
      expect(mockConsole.error).toHaveBeenCalledWith(
        '[TestApp] ERROR:',
        'Error message'
      );
    });

    it('should not log when debug is disabled', async () => {
      mockWindow.__LOGGER_CONFIG__ = { enabled: false, level: 'debug' };

      const { Logger } = await import('@/lib/logger');
      const logger = new Logger('TestApp');

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(mockConsole.log).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).not.toHaveBeenCalled();
    });
  });

  describe('Specialized logger methods', () => {
    it('should log PWA messages', async () => {
      // Enable debug mode for these tests
      mockWindow.__LOGGER_CONFIG__ = { enabled: true, level: 'debug' };

      const { Logger } = await import('@/lib/logger');
      const logger = new Logger('TestApp');
      logger.pwa('Test PWA message');
      expect(mockConsole.log).toHaveBeenCalledWith(
        '[TestApp] DEBUG:',
        '[PWA] Test PWA message'
      );
    });

    it('should log API messages', async () => {
      // Enable debug mode for these tests
      mockWindow.__LOGGER_CONFIG__ = { enabled: true, level: 'debug' };

      const { Logger } = await import('@/lib/logger');
      const logger = new Logger('TestApp');
      logger.api('Test API message');
      expect(mockConsole.log).toHaveBeenCalledWith(
        '[TestApp] DEBUG:',
        '[API] Test API message'
      );
    });

    it('should log auth messages', async () => {
      // Enable debug mode for these tests
      mockWindow.__LOGGER_CONFIG__ = { enabled: true, level: 'debug' };

      const { Logger } = await import('@/lib/logger');
      const logger = new Logger('TestApp');
      logger.auth('Test auth message');
      expect(mockConsole.log).toHaveBeenCalledWith(
        '[TestApp] DEBUG:',
        '[AUTH] Test auth message'
      );
    });
  });
});
