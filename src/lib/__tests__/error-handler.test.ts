import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock the analytics
vi.mock('@/lib/analytics', () => ({
  trackError: vi.fn(),
}));

import { logger } from '@/lib/logger';
import { trackError } from '@/lib/analytics';
import { ErrorHandler } from '../error-handler';

describe('ErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('static methods', () => {
    describe('handleApiError', () => {
      it('handles Error objects', () => {
        const error = new Error('Test error');
        const context = { userId: '123', component: 'TestComponent' };

        const result = ErrorHandler.handleApiError(error, context);

        expect(result).toEqual({
          code: 'API_ERROR',
          message: 'Something went wrong. Please try again.',
          details: 'Test error',
          isRetryable: true,
        });

        expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
          'ErrorHandler: Handling API error',
          { error, context }
        );
      });

      it('handles string errors', () => {
        const error = 'String error message';
        const context = { userId: '123' };

        const result = ErrorHandler.handleApiError(error, context);

        expect(result).toEqual({
          code: 'API_ERROR',
          message: 'String error message',
          details: 'String error message',
          isRetryable: true,
        });
      });

      it('handles unknown error types', () => {
        const unknownError = { custom: 'error', data: 123 };
        const context = { component: 'TestComponent' };

        const result = ErrorHandler.handleApiError(unknownError, context);

        expect(result).toEqual({
          code: 'API_ERROR',
          message: 'Unknown error',
          details: '{"custom":"error","data":123}',
          isRetryable: true,
        });
      });

      it('categorizes network errors', () => {
        const networkError = new Error('Failed to fetch');
        const context = { userId: '123' };

        const result = ErrorHandler.handleApiError(networkError, context);

        expect(result).toEqual({
          code: 'NETWORK_ERROR',
          message:
            'Network connection error. Please check your internet connection.',
          details: 'Failed to fetch',
          isRetryable: true,
        });
      });

      it('categorizes authentication errors', () => {
        const authError = new Error('Unauthorized');
        const context = { userId: '123' };

        const result = ErrorHandler.handleApiError(authError, context);

        expect(result).toEqual({
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please log in again.',
          details: 'Unauthorized',
          statusCode: 401,
          isRetryable: false,
        });
      });

      it('categorizes validation errors', () => {
        const validationError = new Error('Invalid input');
        const context = { userId: '123' };

        const result = ErrorHandler.handleApiError(validationError, context);

        expect(result).toEqual({
          code: 'API_ERROR',
          message: 'Something went wrong. Please try again.',
          details: 'Invalid input',
          isRetryable: true,
        });
      });

      it('handles object errors with status codes', () => {
        const objectError = {
          status: 404,
          message: 'Resource not found',
        };
        const context = { userId: '123' };

        const result = ErrorHandler.handleApiError(objectError, context);

        expect(result).toEqual({
          code: 'NOT_FOUND',
          message: 'The requested resource was not found.',
          details: 'Resource not found',
          statusCode: 404,
          isRetryable: false,
        });
      });

      it('handles object errors with error codes', () => {
        const objectError = {
          code: 'CUSTOM_ERROR',
          message: 'Custom error message',
          details: 'Additional details',
          isRetryable: false,
        };
        const context = { userId: '123' };

        const result = ErrorHandler.handleApiError(objectError, context);

        expect(result).toEqual({
          code: 'CUSTOM_ERROR',
          message: 'Custom error message',
          details: 'Additional details',
          isRetryable: false,
        });
      });
    });

    describe('getUserFriendlyMessage', () => {
      it('returns user-friendly message from error', () => {
        const error = {
          code: 'NETWORK_ERROR',
          message:
            'Network connection error. Please check your internet connection.',
          details: 'Failed to fetch',
          isRetryable: true,
        };

        const result = ErrorHandler.getUserFriendlyMessage(error);

        expect(result).toBe(
          'Network connection error. Please check your internet connection.'
        );
      });

      it('returns fallback message when no message provided', () => {
        const error = {
          code: 'API_ERROR',
          message: 'API error',
          isRetryable: true,
        };

        const result = ErrorHandler.getUserFriendlyMessage(error);

        expect(result).toBe('API error');
      });
    });

    describe('isRetryable', () => {
      it('returns true for retryable errors', () => {
        const error = {
          code: 'NETWORK_ERROR',
          message: 'Network error',
          isRetryable: true,
        };

        const result = ErrorHandler.isRetryable(error);

        expect(result).toBe(true);
      });

      it('returns false for non-retryable errors', () => {
        const error = {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
          isRetryable: false,
        };

        const result = ErrorHandler.isRetryable(error);

        expect(result).toBe(false);
      });

      it('returns true by default when isRetryable is not specified', () => {
        const error = {
          code: 'API_ERROR',
          message: 'API error',
        };

        const result = ErrorHandler.isRetryable(error);

        expect(result).toBe(true);
      });
    });

    describe('logError', () => {
      it('logs error with context', () => {
        const error = {
          code: 'API_ERROR',
          message: 'Test error',
          isRetryable: true,
        };
        const context = { userId: '123', component: 'TestComponent' };

        ErrorHandler.logError(error, context);

        expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
          'ErrorHandler: Application error',
          {
            error,
            context,
            timestamp: expect.any(String),
          }
        );
      });

      it('logs error without context', () => {
        const error = {
          code: 'API_ERROR',
          message: 'Test error',
          isRetryable: true,
        };

        ErrorHandler.logError(error);

        expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
          'ErrorHandler: Application error',
          {
            error,
            context: {},
            timestamp: expect.any(String),
          }
        );
      });
    });

    describe('createErrorResponse', () => {
      it('creates standardized error response', () => {
        const context = { userId: '123', component: 'TestComponent' };

        const result = ErrorHandler.createErrorResponse(
          'CUSTOM_ERROR',
          'Custom error message',
          'Additional details',
          context
        );

        expect(result).toEqual({
          code: 'CUSTOM_ERROR',
          message: 'Custom error message',
          details: 'Additional details',
          isRetryable: true,
        });

        expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
          'ErrorHandler: Application error',
          {
            error: result,
            context,
            timestamp: expect.any(String),
          }
        );
      });

      it('creates error response without details', () => {
        const result = ErrorHandler.createErrorResponse(
          'SIMPLE_ERROR',
          'Simple error message'
        );

        expect(result).toEqual({
          code: 'SIMPLE_ERROR',
          message: 'Simple error message',
          isRetryable: true,
        });
      });
    });
  });

  describe('ErrorCodes', () => {
    it('has all expected error codes', () => {
      expect(ErrorHandler.ErrorCodes).toEqual({
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
      });
    });
  });

  describe('error categorization', () => {
    it('categorizes network errors correctly', () => {
      const networkError = new Error('Failed to fetch');
      const result = ErrorHandler.handleApiError(networkError);

      expect(result.code).toBe('NETWORK_ERROR');
      expect(result.isRetryable).toBe(true);
    });

    it('categorizes timeout errors correctly', () => {
      const timeoutError = new Error('Request timeout');
      const result = ErrorHandler.handleApiError(timeoutError);

      expect(result.code).toBe('TIMEOUT_ERROR');
      expect(result.isRetryable).toBe(true);
    });

    it('categorizes unauthorized errors correctly', () => {
      const authError = new Error('401 Unauthorized');
      const result = ErrorHandler.handleApiError(authError);

      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.statusCode).toBe(401);
      expect(result.isRetryable).toBe(false);
    });

    it('categorizes forbidden errors correctly', () => {
      const forbiddenError = new Error('403 Forbidden');
      const result = ErrorHandler.handleApiError(forbiddenError);

      expect(result.code).toBe('FORBIDDEN');
      expect(result.statusCode).toBe(403);
      expect(result.isRetryable).toBe(false);
    });

    it('categorizes not found errors correctly', () => {
      const notFoundError = new Error('404 Not found');
      const result = ErrorHandler.handleApiError(notFoundError);

      expect(result.code).toBe('API_ERROR');
      expect(result.isRetryable).toBe(true);
    });

    it('categorizes server errors correctly', () => {
      const serverError = new Error('500 Internal Server Error');
      const result = ErrorHandler.handleApiError(serverError);

      expect(result.code).toBe('API_ERROR');
      expect(result.isRetryable).toBe(true);
    });
  });
});
