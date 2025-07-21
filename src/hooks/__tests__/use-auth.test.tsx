import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Kinde auth hook
const mockKindeAuth = {
  user: null as any,
  isLoading: false,
  isAuthenticated: false,
  getToken: vi.fn(),
};

vi.mock('@kinde-oss/kinde-auth-nextjs', () => ({
  useKindeAuth: () => mockKindeAuth,
}));

// Mock the logger
vi.mock('@/lib/logger', () => ({
  authLogger: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import { useAuth } from '../use-auth';
import { authLogger } from '@/lib/logger';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockKindeAuth.user = null;
    mockKindeAuth.isLoading = false;
    mockKindeAuth.isAuthenticated = false;
    mockKindeAuth.getToken.mockResolvedValue('test-token');
  });

  describe('authentication state', () => {
    it('returns loading state when authentication is loading', () => {
      mockKindeAuth.isLoading = true;
      mockKindeAuth.isAuthenticated = false;
      mockKindeAuth.user = null;

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
    });

    it('returns authenticated state when user is authenticated', () => {
      mockKindeAuth.isLoading = false;
      mockKindeAuth.isAuthenticated = true;
      mockKindeAuth.user = {
        id: 'user123',
        email: 'test@example.com',
        given_name: 'John',
        family_name: 'Doe',
      };

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeDefined();
    });

    it('returns unauthenticated state when user is not authenticated', () => {
      mockKindeAuth.isLoading = false;
      mockKindeAuth.isAuthenticated = false;
      mockKindeAuth.user = null;

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
    });
  });

  describe('user transformation', () => {
    it('transforms user with full name when both names provided', () => {
      mockKindeAuth.user = {
        id: 'user123',
        email: 'test@example.com',
        given_name: 'John',
        family_name: 'Doe',
        picture: 'https://example.com/avatar.jpg',
      };
      mockKindeAuth.isAuthenticated = true;

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        given_name: 'John',
        family_name: 'Doe',
        picture: 'https://example.com/avatar.jpg',
        name: 'John Doe',
      });
    });

    it('transforms user with only first name', () => {
      mockKindeAuth.user = {
        id: 'user123',
        email: 'test@example.com',
        given_name: 'John',
        family_name: null,
        picture: null,
      };
      mockKindeAuth.isAuthenticated = true;

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        given_name: 'John',
        family_name: null,
        picture: null,
        name: 'John',
      });
    });

    it('transforms user with only last name', () => {
      mockKindeAuth.user = {
        id: 'user123',
        email: 'test@example.com',
        given_name: null,
        family_name: 'Doe',
        picture: null,
      };
      mockKindeAuth.isAuthenticated = true;

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        given_name: null,
        family_name: 'Doe',
        picture: null,
        name: 'test@example.com',
      });
    });

    it('transforms user with no names, uses email as name', () => {
      mockKindeAuth.user = {
        id: 'user123',
        email: 'test@example.com',
        given_name: null,
        family_name: null,
        picture: null,
      };
      mockKindeAuth.isAuthenticated = true;

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        given_name: null,
        family_name: null,
        picture: null,
        name: 'test@example.com',
      });
    });

    it('transforms user with no email, uses "User" as name', () => {
      mockKindeAuth.user = {
        id: 'user123',
        email: '',
        given_name: null,
        family_name: null,
        picture: null,
      };
      mockKindeAuth.isAuthenticated = true;

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual({
        id: 'user123',
        email: '',
        given_name: null,
        family_name: null,
        picture: null,
        name: 'User',
      });
    });
  });

  describe('getToken', () => {
    it('returns token when available', async () => {
      mockKindeAuth.getToken.mockResolvedValue('test-token');

      const { result } = renderHook(() => useAuth());

      const token = await result.current.getToken();
      expect(token).toBe('test-token');
    });

    it('returns null when no token available', async () => {
      mockKindeAuth.getToken.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      const token = await result.current.getToken();
      expect(token).toBe(null);
    });

    it('handles token retrieval errors', async () => {
      mockKindeAuth.getToken.mockRejectedValue(new Error('Token error'));

      const { result } = renderHook(() => useAuth());

      await expect(result.current.getToken()).rejects.toThrow('Token error');
    });
  });

  describe('state updates', () => {
    it('updates state when authentication status changes', () => {
      // Initial state
      mockKindeAuth.isLoading = true;
      mockKindeAuth.isAuthenticated = false;
      mockKindeAuth.user = null;

      const { result, rerender } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);

      // Update state
      mockKindeAuth.isLoading = false;
      mockKindeAuth.isAuthenticated = true;
      mockKindeAuth.user = {
        id: 'user123',
        email: 'test@example.com',
        given_name: 'John',
        family_name: 'Doe',
      };

      rerender();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeDefined();
    });
  });

  describe('debug logging', () => {
    it('logs auth state changes', () => {
      mockKindeAuth.isLoading = false;
      mockKindeAuth.isAuthenticated = true;
      mockKindeAuth.user = {
        id: 'user123',
        email: 'test@example.com',
        given_name: 'John',
        family_name: 'Doe',
      };

      renderHook(() => useAuth());

      expect(vi.mocked(authLogger.debug)).toHaveBeenCalledWith(
        'Auth state changed:',
        {
          isLoading: false,
          isAuthenticated: true,
          hasUser: true,
          userId: 'user123',
        }
      );
    });
  });
});
