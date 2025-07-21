import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the API client
vi.doMock('@/lib/api-client', () => ({
  apiClient: {
    getHealthData: vi.fn(),
  },
}));

// Mock the logger
vi.doMock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('HealthService', () => {
  let mockApiClient: any;
  let mockLogger: any;
  let HealthService: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Import modules after reset
    const apiClientModule = await import('@/lib/api-client');
    const loggerModule = await import('@/lib/logger');
    const healthServiceModule = await import('@/lib/services/health-service');

    mockApiClient = vi.mocked(apiClientModule.apiClient);
    mockLogger = vi.mocked(loggerModule.logger);
    HealthService = healthServiceModule.HealthService;
  });

  const userId = 'user-123';

  const mockHealthData = {
    dailySummaries: [
      {
        id: 'summary1',
        userId: 'user-123',
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
        userId: 'user-123',
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
        userId: 'user-123',
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getHealthData', () => {
    it('fetches health data successfully', async () => {
      const mockResponse = {
        data: mockHealthData,
        error: null,
        status: 200,
      };

      mockApiClient.getHealthData.mockResolvedValue(mockResponse);

      const result = await HealthService.getHealthData(userId);

      expect(mockApiClient.getHealthData).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        data: mockHealthData,
        error: null,
        isLoading: false,
      });
    });

    it('handles API errors gracefully', async () => {
      const mockError = {
        data: null,
        error: 'Failed to fetch health data',
        status: 500,
      };

      mockApiClient.getHealthData.mockResolvedValue(mockError);

      const result = await HealthService.getHealthData(userId);

      expect(mockApiClient.getHealthData).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        data: null,
        error: 'Failed to fetch health data',
        isLoading: false,
      });
    });

    it('handles network errors', async () => {
      const networkError = new Error('Network error');
      mockApiClient.getHealthData.mockRejectedValue(networkError);

      const result = await HealthService.getHealthData(userId);

      expect(mockApiClient.getHealthData).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        data: null,
        error: 'Failed to load health data',
        isLoading: false,
      });
    });
  });

  describe('getHealthSummary', () => {
    it('returns health summary from health data', async () => {
      // Use today's date for the test
      const today = new Date().toISOString().split('T')[0];
      const mockHealthDataWithToday = {
        ...mockHealthData,
        dailySummaries: [
          {
            ...mockHealthData.dailySummaries[0],
            date: today,
          },
        ],
      };

      const mockResponse = {
        data: mockHealthDataWithToday,
        error: null,
        status: 200,
      };

      mockApiClient.getHealthData.mockResolvedValue(mockResponse);

      const result = await HealthService.getHealthSummary(userId);

      expect(mockApiClient.getHealthData).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        data: {
          today: {
            steps: 8500,
            calories: 2100,
            activeMinutes: 45,
            sleepScore: 85,
            readinessScore: 88,
          },
          weekly: {
            steps: 8500,
            calories: 2100,
            activeMinutes: 45,
            sleepScore: 85,
            readinessScore: 88,
          },
          monthly: {
            steps: 8500,
            calories: 2100,
            activeMinutes: 45,
            sleepScore: 85,
            readinessScore: 88,
          },
        },
        error: null,
        isLoading: false,
      });
    });

    it('handles empty health data', async () => {
      const mockResponse = {
        data: {
          dailySummaries: [],
          sleepDetails: [],
          activityDetails: [],
        },
        error: null,
        status: 200,
      };

      mockApiClient.getHealthData.mockResolvedValue(mockResponse);

      const result = await HealthService.getHealthSummary(userId);

      expect(mockApiClient.getHealthData).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        data: {
          today: {
            steps: 0,
            calories: 0,
            activeMinutes: 0,
            sleepScore: 0,
            readinessScore: 0,
          },
          weekly: {
            steps: 0,
            calories: 0,
            activeMinutes: 0,
            sleepScore: 0,
            readinessScore: 0,
          },
          monthly: {
            steps: 0,
            calories: 0,
            activeMinutes: 0,
            sleepScore: 0,
            readinessScore: 0,
          },
        },
        error: null,
        isLoading: false,
      });
    });
  });

  describe('getLatestSleepData', () => {
    it('returns latest sleep data from health data', async () => {
      const mockResponse = {
        data: mockHealthData,
        error: null,
        status: 200,
      };

      mockApiClient.getHealthData.mockResolvedValue(mockResponse);

      const result = await HealthService.getLatestSleepData(userId);

      expect(mockApiClient.getHealthData).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        data: mockHealthData.sleepDetails[0],
        error: null,
        isLoading: false,
      });
    });

    it('returns null when no sleep data available', async () => {
      const mockResponse = {
        data: {
          dailySummaries: [],
          sleepDetails: [],
          activityDetails: [],
        },
        error: null,
        status: 200,
      };

      mockApiClient.getHealthData.mockResolvedValue(mockResponse);

      const result = await HealthService.getLatestSleepData(userId);

      expect(mockApiClient.getHealthData).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        data: null,
        error: null,
        isLoading: false,
      });
    });
  });

  describe('getLatestActivityData', () => {
    it('returns latest activity data from health data', async () => {
      const mockResponse = {
        data: mockHealthData,
        error: null,
        status: 200,
      };

      mockApiClient.getHealthData.mockResolvedValue(mockResponse);

      const result = await HealthService.getLatestActivityData(userId);

      expect(mockApiClient.getHealthData).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        data: mockHealthData.activityDetails[0],
        error: null,
        isLoading: false,
      });
    });

    it('returns null when no activity data available', async () => {
      const mockResponse = {
        data: {
          dailySummaries: [],
          sleepDetails: [],
          activityDetails: [],
        },
        error: null,
        status: 200,
      };

      mockApiClient.getHealthData.mockResolvedValue(mockResponse);

      const result = await HealthService.getLatestActivityData(userId);

      expect(mockApiClient.getHealthData).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        data: null,
        error: null,
        isLoading: false,
      });
    });
  });
});
