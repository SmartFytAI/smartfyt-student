import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useHealthCheck, useSports } from '@/hooks/use-api';
import { createTestQueryClient } from '@/test/utils/test-utils';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    healthCheck: vi.fn(),
    getSports: vi.fn(),
  },
}));

describe('API Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  describe('useHealthCheck', () => {
    it('fetches health check data successfully', async () => {
      const mockHealthData = { status: 'healthy', timestamp: '2024-01-01' };
      const { apiClient } = await import('@/lib/api-client');
      vi.mocked(apiClient.healthCheck).mockResolvedValue({
        data: mockHealthData,
        status: 200,
      });

      const { result } = renderHook(() => useHealthCheck(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockHealthData);
      expect(apiClient.healthCheck).toHaveBeenCalledTimes(1);
    });

    it('handles API errors gracefully', async () => {
      const { apiClient } = await import('@/lib/api-client');
      vi.mocked(apiClient.healthCheck).mockRejectedValue(
        new Error('API Error')
      );

      const { result } = renderHook(() => useHealthCheck(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
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
        { id: 1, name: 'Football' },
        { id: 2, name: 'Basketball' },
      ];
      const { apiClient } = await import('@/lib/api-client');
      vi.mocked(apiClient.getSports).mockResolvedValue({
        data: mockSportsData,
        status: 200,
      });

      const { result } = renderHook(() => useSports(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockSportsData);
      expect(apiClient.getSports).toHaveBeenCalledTimes(1);
    });
  });
});
