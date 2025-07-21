import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import type {
  HealthData,
  DailyHealthSummary,
  SleepDetail,
  ActivityDetail,
} from '@/types';

export interface HealthServiceResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export interface HealthMetrics {
  steps: number;
  calories: number;
  activeMinutes: number;
  sleepScore: number;
  readinessScore: number;
}

export interface HealthSummary {
  today: HealthMetrics;
  weekly: HealthMetrics;
  monthly: HealthMetrics;
}

/**
 * Health Service - Handles all health-related API calls and data transformation
 */
export class HealthService {
  /**
   * Get user's health data
   */
  static async getHealthData(
    userId: string
  ): Promise<HealthServiceResponse<HealthData>> {
    try {
      logger.debug('HealthService: Fetching health data', { userId });

      const response = await apiClient.getHealthData(userId);

      if (response.error) {
        logger.error('HealthService: Failed to fetch health data', {
          userId,
          error: response.error,
        });
        return {
          data: null,
          error: response.error,
          isLoading: false,
        };
      }

      const healthData: HealthData =
        response.data &&
        typeof response.data === 'object' &&
        'dailySummaries' in response.data &&
        'sleepDetails' in response.data &&
        'activityDetails' in response.data
          ? (response.data as HealthData)
          : {
              dailySummaries: [] as DailyHealthSummary[],
              sleepDetails: [] as SleepDetail[],
              activityDetails: [] as ActivityDetail[],
            };

      logger.info('HealthService: Successfully fetched health data', {
        userId,
        summaryCount: healthData.dailySummaries?.length || 0,
        sleepCount: healthData.sleepDetails?.length || 0,
        activityCount: healthData.activityDetails?.length || 0,
      });

      return {
        data: healthData,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error('HealthService: Unexpected error fetching health data', {
        userId,
        error,
      });
      return {
        data: null,
        error: 'Failed to load health data',
        isLoading: false,
      };
    }
  }

  /**
   * Get health summary with aggregated metrics
   */
  static async getHealthSummary(
    userId: string
  ): Promise<HealthServiceResponse<HealthSummary>> {
    try {
      logger.debug('HealthService: Fetching health summary', { userId });

      const healthResponse = await this.getHealthData(userId);

      if (healthResponse.error || !healthResponse.data) {
        return {
          data: null,
          error: healthResponse.error || 'No health data available',
          isLoading: false,
        };
      }

      const { dailySummaries } = healthResponse.data;

      // Calculate today's metrics
      const today = new Date().toISOString().split('T')[0];
      const todaySummary = dailySummaries.find(
        summary => summary.date === today
      );

      const todayMetrics: HealthMetrics = {
        steps: todaySummary?.steps || 0,
        calories: todaySummary?.calories || 0,
        activeMinutes: todaySummary?.activeMinutes || 0,
        sleepScore: todaySummary?.sleepScore || 0,
        readinessScore: todaySummary?.readinessScore || 0,
      };

      // Calculate weekly metrics (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklySummaries = dailySummaries.filter(
        summary => new Date(summary.date) >= weekAgo
      );

      const weeklyMetrics: HealthMetrics = {
        steps: weeklySummaries.reduce(
          (sum, summary) => sum + (summary.steps || 0),
          0
        ),
        calories: weeklySummaries.reduce(
          (sum, summary) => sum + (summary.calories || 0),
          0
        ),
        activeMinutes: weeklySummaries.reduce(
          (sum, summary) => sum + (summary.activeMinutes || 0),
          0
        ),
        sleepScore:
          weeklySummaries.length > 0
            ? weeklySummaries.reduce(
                (sum, summary) => sum + (summary.sleepScore || 0),
                0
              ) / weeklySummaries.length
            : 0,
        readinessScore:
          weeklySummaries.length > 0
            ? weeklySummaries.reduce(
                (sum, summary) => sum + (summary.readinessScore || 0),
                0
              ) / weeklySummaries.length
            : 0,
      };

      // Calculate monthly metrics (last 30 days)
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthlySummaries = dailySummaries.filter(
        summary => new Date(summary.date) >= monthAgo
      );

      const monthlyMetrics: HealthMetrics = {
        steps: monthlySummaries.reduce(
          (sum, summary) => sum + (summary.steps || 0),
          0
        ),
        calories: monthlySummaries.reduce(
          (sum, summary) => sum + (summary.calories || 0),
          0
        ),
        activeMinutes: monthlySummaries.reduce(
          (sum, summary) => sum + (summary.activeMinutes || 0),
          0
        ),
        sleepScore:
          monthlySummaries.length > 0
            ? monthlySummaries.reduce(
                (sum, summary) => sum + (summary.sleepScore || 0),
                0
              ) / monthlySummaries.length
            : 0,
        readinessScore:
          monthlySummaries.length > 0
            ? monthlySummaries.reduce(
                (sum, summary) => sum + (summary.readinessScore || 0),
                0
              ) / monthlySummaries.length
            : 0,
      };

      const healthSummary: HealthSummary = {
        today: todayMetrics,
        weekly: weeklyMetrics,
        monthly: monthlyMetrics,
      };

      logger.info('HealthService: Successfully calculated health summary', {
        userId,
        todaySteps: todayMetrics.steps,
        weeklySteps: weeklyMetrics.steps,
        monthlySteps: monthlyMetrics.steps,
      });

      return {
        data: healthSummary,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error(
        'HealthService: Unexpected error calculating health summary',
        {
          userId,
          error,
        }
      );
      return {
        data: null,
        error: 'Failed to calculate health summary',
        isLoading: false,
      };
    }
  }

  /**
   * Get latest sleep data
   */
  static async getLatestSleepData(
    userId: string
  ): Promise<HealthServiceResponse<SleepDetail | null>> {
    try {
      logger.debug('HealthService: Fetching latest sleep data', { userId });

      const healthResponse = await this.getHealthData(userId);

      if (healthResponse.error || !healthResponse.data) {
        return {
          data: null,
          error: healthResponse.error || 'No health data available',
          isLoading: false,
        };
      }

      const { sleepDetails } = healthResponse.data;
      const latestSleep = sleepDetails.length > 0 ? sleepDetails[0] : null;

      logger.info('HealthService: Successfully fetched latest sleep data', {
        userId,
        hasSleepData: !!latestSleep,
        sleepDuration: latestSleep?.duration || 0,
      });

      return {
        data: latestSleep,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error(
        'HealthService: Unexpected error fetching latest sleep data',
        {
          userId,
          error,
        }
      );
      return {
        data: null,
        error: 'Failed to load sleep data',
        isLoading: false,
      };
    }
  }

  /**
   * Get latest activity data
   */
  static async getLatestActivityData(
    userId: string
  ): Promise<HealthServiceResponse<ActivityDetail | null>> {
    try {
      logger.debug('HealthService: Fetching latest activity data', { userId });

      const healthResponse = await this.getHealthData(userId);

      if (healthResponse.error || !healthResponse.data) {
        return {
          data: null,
          error: healthResponse.error || 'No health data available',
          isLoading: false,
        };
      }

      const { activityDetails } = healthResponse.data;
      const latestActivity =
        activityDetails.length > 0 ? activityDetails[0] : null;

      logger.info('HealthService: Successfully fetched latest activity data', {
        userId,
        hasActivityData: !!latestActivity,
        activityType: latestActivity?.activityType || 'none',
        duration: latestActivity?.duration || 0,
      });

      return {
        data: latestActivity,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error(
        'HealthService: Unexpected error fetching latest activity data',
        {
          userId,
          error,
        }
      );
      return {
        data: null,
        error: 'Failed to load activity data',
        isLoading: false,
      };
    }
  }
}
