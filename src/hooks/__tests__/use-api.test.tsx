import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useHealthCheck, useSports } from '@/hooks/use-api';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    healthCheck: vi.fn(),
    getSports: vi.fn(),
  },
}));

// Mock the error handler
vi.mock('@/lib/error-handler', () => ({
  ErrorHandler: {
    handleApiError: vi.fn((error) => error),
    logError: vi.fn(),
  },
}));

// Mock the loading manager
vi.mock('@/lib/loading-manager', () => ({
  useComponentLoading: vi.fn(() => ({
    startLoading: vi.fn(),
    stopLoading: vi.fn(),
  })),
  LoadingIds: {
    APP_INIT: 'app-init',
    DATA_SYNC: 'data-sync',
  },
}));

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

describe('API Hooks', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useHealthCheck', () => {
    it('fetches health check data successfully', async () => {
      const mockHealthData = { status: 'healthy', timestamp: '2024-01-01', version: '1.0.0' };
      const mockResponse = { data: mockHealthData, status: 200 };
      const { apiClient } = await import('@/lib/api-client');
      vi.mocked(apiClient.healthCheck).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useHealthCheck(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(apiClient.healthCheck).toHaveBeenCalledTimes(1);
    });

    it('handles API errors gracefully', async () => {
      const { apiClient } = await import('@/lib/api-client');
      vi.mocked(apiClient.healthCheck).mockRejectedValue(
        new Error('API Error')
      );

      const { result } = renderHook(() => useHealthCheck(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useSports', () => {
    it('fetches sports data with proper caching', async () => {
      const mockSportsData = [
        { id: '1', name: 'Football' },
        { id: '2', name: 'Basketball' },
      ];
      const mockResponse = { data: mockSportsData, status: 200 };
      const { apiClient } = await import('@/lib/api-client');
      vi.mocked(apiClient.getSports).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useSports(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(apiClient.getSports).toHaveBeenCalledTimes(1);
    });
  });
});
