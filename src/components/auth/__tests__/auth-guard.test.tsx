import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the logger with inline factory
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

import { logger } from '@/lib/logger';
import { AuthGuard } from '../auth-guard';

describe('AuthGuard', () => {
  const defaultProps = {
    children: <div data-testid='protected-content'>Protected Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it('renders children when user is authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '123', name: 'Test User' },
      isLoading: false,
      isAuthenticated: true,
    });

    render(<AuthGuard {...defaultProps} initialLoadDelay={0} />);

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('shows skeleton loading state when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });

    render(<AuthGuard {...defaultProps} />);

    // Should show skeleton (no "Loading..." text in skeleton)
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    // Should show skeleton elements
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('shows fallback loading state when skeleton is disabled', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });

    render(
      <AuthGuard
        {...defaultProps}
        showSkeleton={false}
        fallback={<div>Please wait...</div>}
      />
    );

    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('redirects to default path when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    render(<AuthGuard {...defaultProps} initialLoadDelay={0} maxRetries={0} />);

    // Wait for the redirect to happen (after initial load delay)
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/');
      },
      { timeout: 3000 }
    );
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects to custom path when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    render(
      <AuthGuard
        {...defaultProps}
        redirectTo='/custom-login'
        initialLoadDelay={0}
        maxRetries={0}
      />
    );

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/custom-login');
      },
      { timeout: 3000 }
    );
  });

  it('retries authentication on failure', async () => {
    // First call: not authenticated, second call: authenticated
    mockUseAuth
      .mockReturnValueOnce({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
      .mockReturnValueOnce({
        user: { id: '123', name: 'Test User' },
        isLoading: false,
        isAuthenticated: true,
      });

    render(
      <AuthGuard
        {...defaultProps}
        maxRetries={1}
        retryDelay={100}
        initialLoadDelay={0}
      />
    );

    // Should eventually show content after retry
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('redirects after max retries', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    render(
      <AuthGuard
        {...defaultProps}
        maxRetries={1}
        retryDelay={50}
        initialLoadDelay={0}
      />
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('handles authentication error gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: 'Auth error',
    });

    render(<AuthGuard {...defaultProps} initialLoadDelay={0} maxRetries={0} />);

    // Should still redirect to login even with error
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('shows fallback during loading state when provided', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });

    const FallbackComponent = () => <div data-testid='fallback'>Fallback</div>;

    render(
      <AuthGuard
        {...defaultProps}
        fallback={<FallbackComponent />}
        showSkeleton={false}
      />
    );

    // Should show fallback during loading
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('handles undefined user gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: undefined,
      isLoading: false,
      isAuthenticated: false,
    });

    render(<AuthGuard {...defaultProps} initialLoadDelay={0} maxRetries={0} />);

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('logs debug information', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '123', name: 'Test User' },
      isLoading: false,
      isAuthenticated: true,
    });

    render(<AuthGuard {...defaultProps} initialLoadDelay={0} />);

    expect(vi.mocked(logger.debug)).toHaveBeenCalled();
  });
});
