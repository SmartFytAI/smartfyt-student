import { logger } from './logger';

export interface AppError {
  code: string;
  message: string;
  details?: string;
  statusCode?: number;
  isRetryable?: boolean;
}

export interface ErrorContext {
  userId?: string;
  component?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

/**
 * Centralized error handling for the SmartFyt Student app
 */
export class ErrorHandler {
  /**
   * Standard error codes
   */
  static readonly ErrorCodes = {
    // Network errors
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    CONNECTION_ERROR: 'CONNECTION_ERROR',

    // Authentication errors
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',

    // API errors
    API_ERROR: 'API_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',

    // Data errors
    DATA_FETCH_ERROR: 'DATA_FETCH_ERROR',
    DATA_PARSE_ERROR: 'DATA_PARSE_ERROR',
    DATA_TRANSFORM_ERROR: 'DATA_TRANSFORM_ERROR',

    // User errors
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    INVALID_USER_ID: 'INVALID_USER_ID',

    // Feature-specific errors
    JOURNAL_CREATE_ERROR: 'JOURNAL_CREATE_ERROR',
    QUEST_COMPLETE_ERROR: 'QUEST_COMPLETE_ERROR',
    HEALTH_DATA_ERROR: 'HEALTH_DATA_ERROR',
    TEAM_DATA_ERROR: 'TEAM_DATA_ERROR',
  } as const;

  /**
   * Handle and standardize errors from API responses
   */
  static handleApiError(error: any, context: ErrorContext = {}): AppError {
    logger.error('ErrorHandler: Handling API error', { error, context });

    // Handle different error types
    if (error instanceof Error) {
      return this.handleStandardError(error, context);
    }

    if (typeof error === 'string') {
      return this.handleStringError(error, context);
    }

    if (error && typeof error === 'object') {
      return this.handleObjectError(error, context);
    }

    // Fallback for unknown error types
    return {
      code: this.ErrorCodes.API_ERROR,
      message: 'An unexpected error occurred',
      details: String(error),
      isRetryable: true,
    };
  }

  /**
   * Handle standard Error objects
   */
  private static handleStandardError(
    error: Error,
    _context: ErrorContext
  ): AppError {
    const message = error.message.toLowerCase();

    // Network-related errors
    if (message.includes('fetch') || message.includes('network')) {
      return {
        code: this.ErrorCodes.NETWORK_ERROR,
        message:
          'Network connection error. Please check your internet connection.',
        details: error.message,
        isRetryable: true,
      };
    }

    if (message.includes('timeout')) {
      return {
        code: this.ErrorCodes.TIMEOUT_ERROR,
        message: 'Request timed out. Please try again.',
        details: error.message,
        isRetryable: true,
      };
    }

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('401')) {
      return {
        code: this.ErrorCodes.UNAUTHORIZED,
        message: 'Authentication required. Please log in again.',
        details: error.message,
        statusCode: 401,
        isRetryable: false,
      };
    }

    if (message.includes('forbidden') || message.includes('403')) {
      return {
        code: this.ErrorCodes.FORBIDDEN,
        message:
          "Access denied. You don't have permission to perform this action.",
        details: error.message,
        statusCode: 403,
        isRetryable: false,
      };
    }

    // Default error handling
    return {
      code: this.ErrorCodes.API_ERROR,
      message: 'Something went wrong. Please try again.',
      details: error.message,
      isRetryable: true,
    };
  }

  /**
   * Handle string errors
   */
  private static handleStringError(
    error: string,
    _context: ErrorContext
  ): AppError {
    const message = error.toLowerCase();

    if (message.includes('user id required')) {
      return {
        code: this.ErrorCodes.INVALID_USER_ID,
        message: 'User ID is required for this operation.',
        details: error,
        isRetryable: false,
      };
    }

    if (message.includes('not found')) {
      return {
        code: this.ErrorCodes.NOT_FOUND,
        message: 'The requested resource was not found.',
        details: error,
        isRetryable: false,
      };
    }

    return {
      code: this.ErrorCodes.API_ERROR,
      message: error,
      details: error,
      isRetryable: true,
    };
  }

  /**
   * Handle object errors (API responses, etc.)
   */
  private static handleObjectError(
    error: any,
    _context: ErrorContext
  ): AppError {
    const statusCode = error.status || error.statusCode;
    const message = error.message || error.error || 'Unknown error';

    // HTTP status code handling
    if (statusCode) {
      switch (statusCode) {
        case 400:
          return {
            code: this.ErrorCodes.VALIDATION_ERROR,
            message: 'Invalid request. Please check your input.',
            details: message,
            statusCode,
            isRetryable: false,
          };

        case 401:
          return {
            code: this.ErrorCodes.UNAUTHORIZED,
            message: 'Authentication required. Please log in again.',
            details: message,
            statusCode,
            isRetryable: false,
          };

        case 403:
          return {
            code: this.ErrorCodes.FORBIDDEN,
            message:
              "Access denied. You don't have permission to perform this action.",
            details: message,
            statusCode,
            isRetryable: false,
          };

        case 404:
          return {
            code: this.ErrorCodes.NOT_FOUND,
            message: 'The requested resource was not found.',
            details: message,
            statusCode,
            isRetryable: false,
          };

        case 500:
        case 502:
        case 503:
          return {
            code: this.ErrorCodes.SERVER_ERROR,
            message: 'Server error. Please try again later.',
            details: message,
            statusCode,
            isRetryable: true,
          };

        default:
          return {
            code: this.ErrorCodes.API_ERROR,
            message: 'An error occurred while processing your request.',
            details: message,
            statusCode,
            isRetryable: statusCode >= 500,
          };
      }
    }

    // Handle specific error types
    if (error.code) {
      return {
        code: error.code,
        message: message,
        details: error.details || error.message,
        statusCode: error.statusCode,
        isRetryable: error.isRetryable ?? true,
      };
    }

    // Default object error handling
    return {
      code: this.ErrorCodes.API_ERROR,
      message: message,
      details: JSON.stringify(error),
      isRetryable: true,
    };
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: AppError): string {
    return error.message || 'Something went wrong. Please try again.';
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: AppError): boolean {
    return error.isRetryable ?? true;
  }

  /**
   * Log error with context
   */
  static logError(error: AppError, context: ErrorContext = {}): void {
    logger.error('ErrorHandler: Application error', {
      error,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Create a standardized error response
   */
  static createErrorResponse(
    code: string,
    message: string,
    details?: string,
    context: ErrorContext = {}
  ): AppError {
    const error: AppError = {
      code,
      message,
      details,
      isRetryable: true,
    };

    this.logError(error, context);
    return error;
  }
}
