import { useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';

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

// Health check
export function useHealthCheck() {
  return useQuery({
    queryKey: [queryKeys.health],
    queryFn: () => apiClient.healthCheck(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Sports
export function useSports() {
  return useQuery({
    queryKey: [queryKeys.sports],
    queryFn: () => apiClient.getSports(),
    staleTime: 30 * 60 * 1000, // 30 minutes - sports don't change often
  });
}

// Schools
export function useSchools() {
  return useQuery({
    queryKey: [queryKeys.schools],
    queryFn: () => apiClient.getSchools(),
    staleTime: 30 * 60 * 1000, // 30 minutes - schools don't change often
  });
}

// User dashboard
export function useDashboard(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.userDashboard(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return apiClient.getDashboard(userId);
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// User info
export function useUserInfo(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.userInfo(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return apiClient.getUserInfo(userId);
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Health data
export function useHealthData(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.healthData(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return apiClient.getHealthData(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Journals
export function useJournals(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.journals(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return apiClient.getJournals(userId);
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Journal dates
export function useJournalDates(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.journalDates(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return apiClient.getJournalDates(userId);
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// User quests
export function useUserQuests(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.quests(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return apiClient.getUserQuests(userId);
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// User teams
export function useTeams(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.teams(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return apiClient.getUserTeams(userId);
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - teams don't change often
  });
}

// User quest stats
export function useUserQuestStats(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.questStats(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return apiClient.getUserStats(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Completed quests
export function useCompletedQuests(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.completedQuests(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return apiClient.getCompletedQuests(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Quest categories
export function useQuestCategories() {
  return useQuery({
    queryKey: queryKeys.questCategories,
    queryFn: () => apiClient.getQuestCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// User metrics
export function useUserMetrics(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.metrics(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return apiClient.getUserMetrics(userId);
    },
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
