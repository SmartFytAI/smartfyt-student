import { useQuery, useQueryClient } from '@tanstack/react-query';

import { logger } from '@/lib/logger';
import { HealthService } from '@/lib/services/health-service';

// Query keys for health-related data
export const healthQueryKeys = {
  healthData: (userId: string) => ['health', 'data', userId],
  healthSummary: (userId: string) => ['health', 'summary', userId],
  latestSleep: (userId: string) => ['health', 'sleep', 'latest', userId],
  latestActivity: (userId: string) => ['health', 'activity', 'latest', userId],
} as const;

/**
 * Hook to fetch user's health data
 */
export function useHealthData(userId: string | null) {
  return useQuery({
    queryKey: healthQueryKeys.healthData(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      logger.debug('useHealthData: Fetching health data', { userId });
      return HealthService.getHealthData(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch health summary with aggregated metrics
 */
export function useHealthSummary(userId: string | null) {
  return useQuery({
    queryKey: healthQueryKeys.healthSummary(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      logger.debug('useHealthSummary: Fetching health summary', { userId });
      return HealthService.getHealthSummary(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch latest sleep data
 */
export function useLatestSleepData(userId: string | null) {
  return useQuery({
    queryKey: healthQueryKeys.latestSleep(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      logger.debug('useLatestSleepData: Fetching latest sleep data', {
        userId,
      });
      return HealthService.getLatestSleepData(userId);
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to fetch latest activity data
 */
export function useLatestActivityData(userId: string | null) {
  return useQuery({
    queryKey: healthQueryKeys.latestActivity(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      logger.debug('useLatestActivityData: Fetching latest activity data', {
        userId,
      });
      return HealthService.getLatestActivityData(userId);
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to invalidate health-related queries
 */
export function useInvalidateHealthQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateHealthData: (userId: string) => {
      queryClient.invalidateQueries({
        queryKey: healthQueryKeys.healthData(userId),
      });
    },
    invalidateHealthSummary: (userId: string) => {
      queryClient.invalidateQueries({
        queryKey: healthQueryKeys.healthSummary(userId),
      });
    },
    invalidateLatestSleep: (userId: string) => {
      queryClient.invalidateQueries({
        queryKey: healthQueryKeys.latestSleep(userId),
      });
    },
    invalidateLatestActivity: (userId: string) => {
      queryClient.invalidateQueries({
        queryKey: healthQueryKeys.latestActivity(userId),
      });
    },
    invalidateAllHealthQueries: (_userId: string) => {
      queryClient.invalidateQueries({ queryKey: ['health'] });
    },
  };
}
