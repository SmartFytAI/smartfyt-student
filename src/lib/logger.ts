// Logger utility with configurable debug levels
type LogLevel = 'error' | 'warn' | 'debug' | 'info';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
}

// Global debug configuration
declare global {
  interface Window {
    ENABLE_DEBUG: (level?: LogLevel) => void;
    DISABLE_DEBUG: () => void;
    __LOGGER_CONFIG__: LoggerConfig;
    __LOGGER_INITIALIZED__: boolean;
  }
}

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Default configuration - auto-enable debug in development
const defaultConfig: LoggerConfig = {
  enabled: isDevelopment,
  level: isDevelopment ? 'debug' : 'error',
};

// Initialize global configuration only once
if (typeof window !== 'undefined' && !window.__LOGGER_INITIALIZED__) {
  window.__LOGGER_CONFIG__ = { ...defaultConfig };
  window.__LOGGER_INITIALIZED__ = true;

  // Global debug function
  window.ENABLE_DEBUG = (level: LogLevel = 'debug') => {
    // Only update if config actually changed
    const currentConfig = window.__LOGGER_CONFIG__;
    if (!currentConfig.enabled || currentConfig.level !== level) {
      window.__LOGGER_CONFIG__ = {
        enabled: true,
        level,
      };
      console.log(`🔧 Debug logging enabled at level: ${level}`);
    }
  };

  // Global disable function
  window.DISABLE_DEBUG = () => {
    window.__LOGGER_CONFIG__ = { enabled: false, level: 'error' };
    console.log('🔧 Debug logging disabled');
  };

  // Auto-enable debug in development
  if (isDevelopment) {
    console.log('🔧 Debug logging auto-enabled in development mode');
  }
}

// Log level priorities
const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Get current configuration
const getConfig = (): LoggerConfig => {
  if (typeof window !== 'undefined') {
    return window.__LOGGER_CONFIG__ || defaultConfig;
  }
  return defaultConfig;
};

// Check if logging is enabled for a given level
const shouldLog = (level: LogLevel): boolean => {
  const config = getConfig();
  if (!config.enabled) return false;

  return LOG_LEVELS[level] <= LOG_LEVELS[config.level];
};

// Logger class
class Logger {
  private prefix: string;

  constructor(prefix: string = 'SmartFyt') {
    this.prefix = prefix;
  }

  error(message: string, ...args: any[]): void {
    if (shouldLog('error')) {
      console.error(`[${this.prefix}] ERROR:`, message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (shouldLog('warn')) {
      console.warn(`[${this.prefix}] WARN:`, message, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (shouldLog('info')) {
      console.info(`[${this.prefix}] INFO:`, message, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (shouldLog('debug')) {
      console.log(`[${this.prefix}] DEBUG:`, message, ...args);
    }
  }

  // Convenience method for PWA-specific logging
  pwa(message: string, ...args: any[]): void {
    this.debug(`[PWA] ${message}`, ...args);
  }

  // Convenience method for API-specific logging
  api(message: string, ...args: any[]): void {
    this.debug(`[API] ${message}`, ...args);
  }

  // Convenience method for auth-specific logging
  auth(message: string, ...args: any[]): void {
    this.debug(`[AUTH] ${message}`, ...args);
  }
}

// Create default logger instance
export const logger = new Logger();

// Create specialized loggers
export const pwaLogger = new Logger('SmartFyt-PWA');
export const apiLogger = new Logger('SmartFyt-API');
export const authLogger = new Logger('SmartFyt-Auth');

// Export logger class for custom instances
export { Logger };

// Export types
export type { LogLevel, LoggerConfig };

// Utility function to enable debug logging
export const enableDebug = (level: LogLevel = 'debug'): void => {
  if (typeof window !== 'undefined') {
    window.ENABLE_DEBUG(level);
  }
};

// Utility function to disable debug logging
export const disableDebug = (): void => {
  if (typeof window !== 'undefined') {
    window.DISABLE_DEBUG();
  }
};

// Utility function to check if debug is enabled
export const isDebugEnabled = (): boolean => {
  return getConfig().enabled;
};
