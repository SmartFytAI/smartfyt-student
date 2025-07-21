import { useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/error-handler';
import { useComponentLoading, LoadingIds } from '@/lib/loading-manager';
import { logger } from '@/lib/logger';

// Query keys
export const queryKeys = {
  health: '/health',
  sports: '/sports',
  schools: '/schools',
  userDashboard: (userId: string) => ['dashboard', userId],
  userInfo: (userId: string) => ['user', userId, 'info'],
  healthData: (userId: string) => ['health', userId],
  journals: (userId: string) => ['journals', userId],
  journalDates: (userId: string) => ['journals', userId, 'dates'],
  quests: (userId: string) => ['quests', userId],
  teams: (userId: string) => ['teams', userId],
  questStats: (userId: string) => ['quest-stats', userId],
  completedQuests: (userId: string) => ['completed-quests', userId],
  questCategories: ['quest-categories'],
  metrics: (userId: string) => ['metrics', userId],
} as const;

// Generic query function with error handling and loading management
function createQueryFn<T>(
  apiCall: () => Promise<T>,
  loadingId: string,
  context: { userId?: string | null; component?: string; action?: string }
) {
  return async (): Promise<T> => {
    const { startLoading, stopLoading } = useComponentLoading(loadingId);

    try {
      startLoading();
      logger.debug('API call started', { loadingId, context });

      const result = await apiCall();

      logger.debug('API call successful', { loadingId, context });
      return result;
    } catch (error) {
      // Convert context to match ErrorContext interface
      const errorContext = {
        userId: context.userId || undefined,
        component: context.component,
        action: context.action,
      };

      const appError = ErrorHandler.handleApiError(error, errorContext);
      ErrorHandler.logError(appError, errorContext);

      logger.error('API call failed', {
        loadingId,
        context: errorContext,
        error: appError,
      });

      throw appError;
    } finally {
      stopLoading();
    }
  };
}

// Health check
export function useHealthCheck() {
  return useQuery({
    queryKey: [queryKeys.health],
    queryFn: createQueryFn(() => apiClient.healthCheck(), LoadingIds.APP_INIT, {
      component: 'HealthCheck',
      action: 'health-check',
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Sports
export function useSports() {
  return useQuery({
    queryKey: [queryKeys.sports],
    queryFn: createQueryFn(() => apiClient.getSports(), LoadingIds.DATA_SYNC, {
      component: 'Sports',
      action: 'get-sports',
    }),
    staleTime: 30 * 60 * 1000, // 30 minutes - sports don't change often
  });
}

// Schools
export function useSchools() {
  return useQuery({
    queryKey: [queryKeys.schools],
    queryFn: createQueryFn(() => apiClient.getSchools(), LoadingIds.DATA_SYNC, {
      component: 'Schools',
      action: 'get-schools',
    }),
    staleTime: 30 * 60 * 1000, // 30 minutes - schools don't change often
  });
}

// User dashboard
export function useDashboard(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.userDashboard(userId || ''),
    queryFn: createQueryFn(
      () => {
        if (!userId) throw new Error('User ID required');
        return apiClient.getDashboard(userId);
      },
      LoadingIds.DASHBOARD_LOAD,
      { userId, component: 'Dashboard', action: 'get-dashboard' }
    ),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// User info
export function useUserInfo(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.userInfo(userId || ''),
    queryFn: createQueryFn(
      () => {
        if (!userId) throw new Error('User ID required');
        return apiClient.getUserInfo(userId);
      },
      LoadingIds.USER_PROFILE_LOAD,
      { userId, component: 'UserInfo', action: 'get-user-info' }
    ),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Health data
export function useHealthData(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.healthData(userId || ''),
    queryFn: createQueryFn(
      () => {
        if (!userId) throw new Error('User ID required');
        return apiClient.getHealthData(userId);
      },
      LoadingIds.HEALTH_DATA_LOAD,
      { userId, component: 'HealthData', action: 'get-health-data' }
    ),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Journals
export function useJournals(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.journals(userId || ''),
    queryFn: createQueryFn(
      () => {
        if (!userId) throw new Error('User ID required');
        return apiClient.getJournals(userId);
      },
      LoadingIds.JOURNAL_LOAD,
      { userId, component: 'Journals', action: 'get-journals' }
    ),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Journal dates
export function useJournalDates(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.journalDates(userId || ''),
    queryFn: createQueryFn(
      () => {
        if (!userId) throw new Error('User ID required');
        return apiClient.getJournalDates(userId);
      },
      LoadingIds.JOURNAL_LOAD,
      { userId, component: 'JournalDates', action: 'get-journal-dates' }
    ),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// User quests
export function useUserQuests(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.quests(userId || ''),
    queryFn: createQueryFn(
      () => {
        if (!userId) throw new Error('User ID required');
        return apiClient.getUserQuests(userId);
      },
      LoadingIds.QUEST_LOAD,
      { userId, component: 'UserQuests', action: 'get-user-quests' }
    ),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// User teams
export function useTeams(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.teams(userId || ''),
    queryFn: createQueryFn(
      () => {
        if (!userId) throw new Error('User ID required');
        return apiClient.getUserTeams(userId);
      },
      LoadingIds.TEAM_LOAD,
      { userId, component: 'Teams', action: 'get-user-teams' }
    ),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - teams don't change often
  });
}

// User quest stats
export function useUserQuestStats(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.questStats(userId || ''),
    queryFn: createQueryFn(
      () => {
        if (!userId) throw new Error('User ID required');
        return apiClient.getUserStats(userId);
      },
      LoadingIds.QUEST_LOAD,
      { userId, component: 'UserQuestStats', action: 'get-user-stats' }
    ),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Completed quests
export function useCompletedQuests(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.completedQuests(userId || ''),
    queryFn: createQueryFn(
      () => {
        if (!userId) throw new Error('User ID required');
        return apiClient.getCompletedQuests(userId);
      },
      LoadingIds.QUEST_LOAD,
      { userId, component: 'CompletedQuests', action: 'get-completed-quests' }
    ),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Quest categories
export function useQuestCategories() {
  return useQuery({
    queryKey: queryKeys.questCategories,
    queryFn: createQueryFn(
      () => apiClient.getQuestCategories(),
      LoadingIds.DATA_SYNC,
      { component: 'QuestCategories', action: 'get-quest-categories' }
    ),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// User metrics
export function useUserMetrics(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.metrics(userId || ''),
    queryFn: createQueryFn(
      () => {
        if (!userId) throw new Error('User ID required');
        return apiClient.getUserMetrics(userId);
      },
      LoadingIds.DASHBOARD_LOAD,
      { userId, component: 'UserMetrics', action: 'get-user-metrics' }
    ),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Invalidation helpers
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateUserData: (userId: string) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userDashboard(userId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.userInfo(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.healthData(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.journals(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.quests(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.questStats(userId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.completedQuests(userId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.metrics(userId) });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },
  };
}
