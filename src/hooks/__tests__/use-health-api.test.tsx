import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the HealthService
vi.mock('@/lib/services/health-service', () => ({
  HealthService: {
    getHealthData: vi.fn(),
    getHealthSummary: vi.fn(),
    getLatestSleepData: vi.fn(),
    getLatestActivityData: vi.fn(),
  },
}));

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

import { HealthService } from '@/lib/services/health-service';
import {
  useHealthData,
  useHealthSummary,
  useLatestSleepData,
  useLatestActivityData,
} from '../use-health-api';

// Create a wrapper component with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useHealthApi', () => {
  const userId = 'test-user-123';
  const mockHealthService = vi.mocked(HealthService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useHealthData', () => {
    it('fetches health data successfully', async () => {
      const mockHealthData = {
        dailySummaries: [
          {
            id: 'summary1',
            userId: 'test-user-123',
            date: '2024-01-03',
            steps: 8500,
            calories: 2100,
            activeMinutes: 45,
            sleepScore: 85,
            readinessScore: 88,
          },
        ],
        sleepDetails: [
          {
            id: 'sleep1',
            userId: 'test-user-123',
            startTime: '2024-01-02T22:00:00Z',
            endTime: '2024-01-03T06:00:00Z',
            duration: 480,
            efficiency: 92,
            restlessCount: 3,
            deepSleepMinutes: 120,
            lightSleepMinutes: 240,
            remSleepMinutes: 120,
          },
        ],
        activityDetails: [
          {
            id: 'activity1',
            userId: 'test-user-123',
            startTime: '2024-01-03T08:00:00Z',
            endTime: '2024-01-03T09:00:00Z',
            activityType: 'running',
            duration: 60,
            calories: 450,
            distance: 5.2,
            averageHeartRate: 145,
            maxHeartRate: 165,
          },
        ],
      };

      mockHealthService.getHealthData.mockResolvedValue(mockHealthData);

      const { result } = renderHook(() => useHealthData(userId), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toEqual(mockHealthData);
      expect(result.current.error).toBeNull();
      expect(mockHealthService.getHealthData).toHaveBeenCalledWith(userId);
    });

    it('handles API errors', async () => {
      const error = new Error('Failed to fetch health data');
      mockHealthService.getHealthData.mockRejectedValue(error);

      const { result } = renderHook(() => useHealthData(userId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeTruthy();
    });

    it('does not fetch when userId is null', () => {
      const { result } = renderHook(() => useHealthData(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
      expect(mockHealthService.getHealthData).not.toHaveBeenCalled();
    });
  });

  describe('useHealthSummary', () => {
    it('fetches health summary successfully', async () => {
      const mockSummary = {
        totalSteps: 8500,
        totalCalories: 2100,
        totalActiveMinutes: 45,
        averageSleepScore: 85,
        averageReadinessScore: 88,
        weeklyTrend: 'up',
      };

      mockHealthService.getHealthSummary.mockResolvedValue(mockSummary);

      const { result } = renderHook(() => useHealthSummary(userId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toEqual(mockSummary);
      expect(result.current.error).toBeNull();
      expect(mockHealthService.getHealthSummary).toHaveBeenCalledWith(userId);
    });

    it('handles health summary errors', async () => {
      const error = new Error('Failed to fetch summary');
      mockHealthService.getHealthSummary.mockRejectedValue(error);

      const { result } = renderHook(() => useHealthSummary(userId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useLatestSleepData', () => {
    it('fetches latest sleep data successfully', async () => {
      const mockSleepData = {
        id: 'sleep1',
        userId: 'test-user-123',
        startTime: '2024-01-02T22:00:00Z',
        endTime: '2024-01-03T06:00:00Z',
        duration: 480,
        efficiency: 92,
        restlessCount: 3,
        deepSleepMinutes: 120,
        lightSleepMinutes: 240,
        remSleepMinutes: 120,
      };

      mockHealthService.getLatestSleepData.mockResolvedValue(mockSleepData);

      const { result } = renderHook(() => useLatestSleepData(userId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toEqual(mockSleepData);
      expect(result.current.error).toBeNull();
      expect(mockHealthService.getLatestSleepData).toHaveBeenCalledWith(userId);
    });

    it('handles latest sleep data errors', async () => {
      const error = new Error('Failed to fetch sleep data');
      mockHealthService.getLatestSleepData.mockRejectedValue(error);

      const { result } = renderHook(() => useLatestSleepData(userId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useLatestActivityData', () => {
    it('fetches latest activity data successfully', async () => {
      const mockActivityData = {
        id: 'activity1',
        userId: 'test-user-123',
        startTime: '2024-01-03T08:00:00Z',
        endTime: '2024-01-03T09:00:00Z',
        activityType: 'running',
        duration: 60,
        calories: 450,
        distance: 5.2,
        averageHeartRate: 145,
        maxHeartRate: 165,
      };

      mockHealthService.getLatestActivityData.mockResolvedValue(
        mockActivityData
      );

      const { result } = renderHook(() => useLatestActivityData(userId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toEqual(mockActivityData);
      expect(result.current.error).toBeNull();
      expect(mockHealthService.getLatestActivityData).toHaveBeenCalledWith(
        userId
      );
    });

    it('handles latest activity data errors', async () => {
      const error = new Error('Failed to fetch activity data');
      mockHealthService.getLatestActivityData.mockRejectedValue(error);

      const { result } = renderHook(() => useLatestActivityData(userId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('handles service errors consistently', async () => {
      const error = new Error('Service error');
      mockHealthService.getHealthData.mockRejectedValue(error);

      const { result } = renderHook(() => useHealthData(userId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });
  });
});
