import { useQuery, useQueryClient } from '@tanstack/react-query';

import { ErrorHandler } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { TeamService } from '@/lib/services/team-service';

// Query keys for team-related data
export const teamQueryKeys = {
  userTeams: (userId: string) => ['teams', 'user', userId],
  teamLeaderboard: (teamId: string) => ['teams', 'leaderboard', teamId],
  schoolLeaderboard: (userId: string) => [
    'teams',
    'school-leaderboard',
    userId,
  ],
  combinedLeaderboard: (userId: string, teamId?: string) => [
    'teams',
    'combined-leaderboard',
    userId,
    teamId,
  ],
} as const;

// Generic team query function with error handling
function createTeamQueryFn<T>(
  apiCall: () => Promise<T>,
  context: {
    userId?: string | null;
    teamId?: string | null;
    component?: string;
    action?: string;
  }
) {
  return async (): Promise<T> => {
    try {
      logger.debug('Team API call started', { context });

      const result = await apiCall();

      logger.debug('Team API call successful', { context });
      return result;
    } catch (error) {
      // Convert context to match ErrorContext interface
      const errorContext = {
        userId: context.userId || undefined,
        component: context.component,
        action: context.action,
        additionalData: context.teamId ? { teamId: context.teamId } : undefined,
      };

      const appError = ErrorHandler.handleApiError(error, errorContext);
      ErrorHandler.logError(appError, errorContext);

      logger.error('Team API call failed', {
        context: errorContext,
        error: appError,
      });

      throw appError;
    }
  };
}

/**
 * Hook to fetch user's teams
 */
export function useUserTeams(userId: string | null) {
  logger.debug('useUserTeams hook called', {
    userId,
    hasUserId: !!userId,
    enabled: !!userId,
  });

  return useQuery({
    queryKey: teamQueryKeys.userTeams(userId || ''),
    queryFn: createTeamQueryFn(
      () => {
        logger.debug('useUserTeams queryFn executing', { userId });
        if (!userId) throw new Error('User ID required');
        return TeamService.getUserTeams(userId);
      },
      { userId, component: 'UserTeams', action: 'get-user-teams' }
    ),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch team leaderboard
 */
export function useTeamLeaderboard(teamId: string | null) {
  return useQuery({
    queryKey: teamQueryKeys.teamLeaderboard(teamId || ''),
    queryFn: createTeamQueryFn(
      () => {
        if (!teamId) throw new Error('Team ID required');
        return TeamService.getTeamLeaderboard(teamId);
      },
      { teamId, component: 'TeamLeaderboard', action: 'get-team-leaderboard' }
    ),
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch school leaderboard
 */
export function useSchoolLeaderboard(userId: string | null) {
  return useQuery({
    queryKey: teamQueryKeys.schoolLeaderboard(userId || ''),
    queryFn: createTeamQueryFn(
      () => {
        if (!userId) throw new Error('User ID required');
        return TeamService.getSchoolLeaderboard(userId);
      },
      {
        userId,
        component: 'SchoolLeaderboard',
        action: 'get-school-leaderboard',
      }
    ),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch combined leaderboard (team + school)
 */
export function useCombinedLeaderboard(userId: string | null, teamId?: string) {
  return useQuery({
    queryKey: teamQueryKeys.combinedLeaderboard(userId || '', teamId),
    queryFn: createTeamQueryFn(
      () => {
        if (!userId) throw new Error('User ID required');
        return TeamService.getCombinedLeaderboard(userId, teamId);
      },
      {
        userId,
        teamId,
        component: 'CombinedLeaderboard',
        action: 'get-combined-leaderboard',
      }
    ),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to invalidate team-related queries
 */
export function useInvalidateTeamQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateUserTeams: (userId: string) => {
      queryClient.invalidateQueries({
        queryKey: teamQueryKeys.userTeams(userId),
      });
    },
    invalidateTeamLeaderboard: (teamId: string) => {
      queryClient.invalidateQueries({
        queryKey: teamQueryKeys.teamLeaderboard(teamId),
      });
    },
    invalidateSchoolLeaderboard: (userId: string) => {
      queryClient.invalidateQueries({
        queryKey: teamQueryKeys.schoolLeaderboard(userId),
      });
    },
    invalidateCombinedLeaderboard: (userId: string, teamId?: string) => {
      queryClient.invalidateQueries({
        queryKey: teamQueryKeys.combinedLeaderboard(userId, teamId),
      });
    },
    invalidateAllTeamQueries: (_userId: string, _teamId?: string) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  };
}
