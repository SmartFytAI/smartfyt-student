import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';

export interface Quest {
  id: string;
  title: string;
  description: string;
  pointValue: number;
  categoryName: string;
  completedAt?: string | null;
  notes?: string | null;
  status?: 'assigned' | 'completed' | 'expired';
}

export interface AvailableQuest {
  id: string;
  title: string;
  description: string;
  pointValue: number;
  categoryName: string;
  isNew: boolean;
}

export interface UserStat {
  id: string;
  categoryId: string;
  categoryName: string;
  points: number;
  level: number;
}

export interface QuestCompletion {
  totalQuests: number;
  completedQuests: number;
  percentage: number;
}

export interface LeaderboardUser {
  id: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  performanceScore: number;
  trend: 'up' | 'down' | 'none';
}

export interface QuestLeaderboard {
  teamLeaderboard: LeaderboardUser[];
  schoolLeaderboard: LeaderboardUser[];
}

/**
 * Get current assigned quests for a user
 */
export async function getCurrentQuests(userId: string): Promise<Quest[]> {
  try {
    logger.debug('🔍 Fetching current quests for user:', userId);

    const response = await apiClient.getUserQuests(userId);

    if (response.error) {
      logger.error('❌ Failed to fetch current quests:', response.error);
      return [];
    }

    const quests = (response.data as Quest[]) || [];
    logger.debug('✅ Found current quests:', quests.length);
    return quests;
  } catch (error) {
    logger.error('❌ Error fetching current quests:', error);
    return [];
  }
}

/**
 * Get completed quests for a user
 */
export async function getCompletedQuests(userId: string): Promise<Quest[]> {
  try {
    logger.debug('🔍 Fetching completed quests for user:', userId);

    const response = await apiClient.getCompletedQuests(userId);

    if (response.error) {
      logger.error('❌ Failed to fetch completed quests:', response.error);
      return [];
    }

    const quests = (response.data as Quest[]) || [];
    logger.debug('✅ Found completed quests:', quests.length);
    return quests;
  } catch (error) {
    logger.error('❌ Error fetching completed quests:', error);
    return [];
  }
}

/**
 * Get available quests that user hasn't joined or completed
 */
export async function getAvailableQuests(userId: string): Promise<AvailableQuest[]> {
  try {
    logger.debug('🔍 Fetching available quests for user:', userId);

    const response = await apiClient.getAvailableQuests(userId);

    if (response.error) {
      logger.error('❌ Failed to fetch available quests:', response.error);
      return [];
    }

    const quests = (response.data as AvailableQuest[]) || [];
    logger.debug('✅ Found available quests:', quests.length);
    return quests;
  } catch (error) {
    logger.error('❌ Error fetching available quests:', error);
    return [];
  }
}

/**
 * Join/assign a specific quest to a user
 */
export async function joinQuest(
  userId: string,
  questId: string
): Promise<Quest | null> {
  try {
    logger.debug('🔍 Joining quest for user:', { userId, questId });

    const response = await apiClient.joinQuest(userId, questId);

    if (response.error) {
      logger.error('❌ Failed to join quest:', response.error);
      return null;
    }

    const quest = response.data as Quest;
    logger.debug('✅ Successfully joined quest:', quest?.title);
    return quest;
  } catch (error) {
    logger.error('❌ Error joining quest:', error);
    return null;
  }
}

/**
 * Get user stats (points and levels) for all categories
 */
export async function getUserStats(userId: string): Promise<UserStat[]> {
  try {
    logger.debug('🔍 Fetching user stats for user:', userId);

    const response = await apiClient.getUserStats(userId);

    if (response.error) {
      logger.error('❌ Failed to fetch user stats:', response.error);
      return [];
    }

    const stats = (response.data as UserStat[]) || [];
    logger.debug('✅ Found user stats:', stats.length);
    return stats;
  } catch (error) {
    logger.error('❌ Error fetching user stats:', error);
    return [];
  }
}

/**
 * Complete a quest for a user
 */
export async function completeQuest(
  userId: string,
  questId: string,
  notes?: string
): Promise<{
  success: boolean;
  points?: number;
  newLevel?: number;
  totalPoints?: number;
}> {
  try {
    logger.debug('🎯 Completing quest:', { userId, questId, notes });

    const response = await apiClient.completeQuest(
      userId,
      questId,
      notes || ''
    );

    if (response.error) {
      logger.error('❌ Failed to complete quest:', response.error);
      return { success: false };
    }

    logger.debug('✅ Quest completed successfully:', response.data);

    // Handle the response data safely
    const responseData = response.data as any;
    return {
      success: true,
      points: responseData?.points || 0,
      newLevel: responseData?.newLevel || 1,
      totalPoints: responseData?.totalPoints || 0,
    };
  } catch (error) {
    logger.error('❌ Error completing quest:', error);
    return { success: false };
  }
}

/**
 * Assign new quests to a user
 */
export async function assignNewQuests(userId: string): Promise<Quest[]> {
  try {
    logger.debug('🎯 Assigning new quests for user:', userId);

    const response = await apiClient.assignQuests(userId);

    if (response.error) {
      logger.error('❌ Failed to assign new quests:', response.error);
      return [];
    }

    const quests = response.data || [];
    logger.debug('✅ New quests assigned:', quests.length);
    return quests;
  } catch (error) {
    logger.error('❌ Error assigning new quests:', error);
    return [];
  }
}

/**
 * Get quest completion statistics for a user
 */
export async function getQuestCompletion(
  userId: string
): Promise<QuestCompletion> {
  try {
    logger.debug('📊 Fetching quest completion for user:', userId);

    // Calculate completion from current and completed quests
    const [currentQuests, completedQuests] = await Promise.all([
      getCurrentQuests(userId),
      getCompletedQuests(userId),
    ]);

    const totalQuests = currentQuests.length + completedQuests.length;
    const completedCount = completedQuests.length;
    const percentage =
      totalQuests > 0 ? Math.round((completedCount / totalQuests) * 100) : 0;

    const completion = {
      totalQuests,
      completedQuests: completedCount,
      percentage,
    };

    logger.debug('✅ Quest completion stats:', completion);
    return completion;
  } catch (error) {
    logger.error('❌ Error fetching quest completion:', error);
    return {
      totalQuests: 0,
      completedQuests: 0,
      percentage: 0,
    };
  }
}

/**
 * Get team leaderboard
 */
export async function getTeamLeaderboard(
  teamId: string
): Promise<LeaderboardUser[]> {
  try {
    logger.debug('🏆 Fetching team leaderboard for team:', teamId);

    const response = await apiClient.getTeamLeaderboard(teamId);

    if (response.error) {
      logger.error('❌ Failed to fetch team leaderboard:', response.error);
      return [];
    }

    const leaderboard = response.data || [];
    logger.debug('✅ Team leaderboard fetched:', leaderboard.length);
    return leaderboard;
  } catch (error) {
    logger.error('❌ Error fetching team leaderboard:', error);
    return [];
  }
}

/**
 * Get school leaderboard
 */
export async function getSchoolLeaderboard(
  userId: string
): Promise<LeaderboardUser[]> {
  try {
    logger.debug('🏆 Fetching school leaderboard for user:', userId);

    const response = await apiClient.getSchoolLeaderboard(userId);

    if (response.error) {
      logger.error('❌ Failed to fetch school leaderboard:', response.error);
      return [];
    }

    const leaderboard = response.data || [];
    logger.debug('✅ School leaderboard fetched:', leaderboard.length);
    return leaderboard;
  } catch (error) {
    logger.error('❌ Error fetching school leaderboard:', error);
    return [];
  }
}

/**
 * Get quest leaderboard (team and school)
 */
export async function getQuestLeaderboard(
  userId: string,
  teamId?: string
): Promise<QuestLeaderboard> {
  try {
    logger.debug('🏆 Fetching quest leaderboard:', { userId, teamId });

    const [teamLeaderboard, schoolLeaderboard] = await Promise.all([
      teamId ? getTeamLeaderboard(teamId) : Promise.resolve([]),
      getSchoolLeaderboard(userId),
    ]);

    const leaderboard = {
      teamLeaderboard,
      schoolLeaderboard,
    };

    logger.debug('✅ Quest leaderboard fetched:', {
      teamCount: teamLeaderboard.length,
      schoolCount: schoolLeaderboard.length,
    });

    return leaderboard;
  } catch (error) {
    logger.error('❌ Error fetching quest leaderboard:', error);
    return {
      teamLeaderboard: [],
      schoolLeaderboard: [],
    };
  }
}

/**
 * Get total quest score for a user
 */
export async function getTotalQuestScore(userId: string): Promise<number> {
  try {
    logger.debug('🏆 Fetching total quest score for user:', userId);

    const stats = await getUserStats(userId);
    const totalScore = stats.reduce((sum, stat) => sum + stat.points, 0);

    logger.debug('✅ Total quest score:', totalScore);
    return totalScore;
  } catch (error) {
    logger.error('❌ Error fetching total quest score:', error);
    return 0;
  }
}

// ============================================================================
// React Query Hooks for Caching
// ============================================================================

/**
 * React Query hook for current quests with caching
 */
export function useCurrentQuests(userId: string | null) {
  return useQuery({
    queryKey: ['quests', 'current', userId],
    queryFn: () => getCurrentQuests(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * React Query hook for completed quests with caching
 */
export function useCompletedQuests(userId: string | null) {
  return useQuery({
    queryKey: ['quests', 'completed', userId],
    queryFn: () => getCompletedQuests(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes (completed quests change less often)
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * React Query hook for user stats with caching
 */
export function useUserStats(userId: string | null) {
  return useQuery({
    queryKey: ['user', 'stats', userId],
    queryFn: () => getUserStats(userId!),
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
  });
}

/**
 * React Query hook for quest completion with caching
 */
export function useQuestCompletion(userId: string | null) {
  return useQuery({
    queryKey: ['quests', 'completion', userId],
    queryFn: () => getQuestCompletion(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * React Query hook for total quest score with caching
 */
export function useTotalQuestScore(userId: string | null) {
  return useQuery({
    queryKey: ['quests', 'score', userId],
    queryFn: () => getTotalQuestScore(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * React Query hook for available quests with caching
 */
export function useAvailableQuests(userId: string | null) {
  return useQuery({
    queryKey: ['quests', 'available', userId],
    queryFn: () => getAvailableQuests(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * React Query hook for joining quests with cache invalidation
 */
export function useJoinQuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      questId,
    }: {
      userId: string;
      questId: string;
    }) => joinQuest(userId, questId),
    onSuccess: (data, variables) => {
      if (data) {
        // Invalidate current quests to show new assignments
        queryClient.invalidateQueries({
          queryKey: ['quests', 'current', variables.userId],
        });
        queryClient.invalidateQueries({
          queryKey: ['quests', 'available', variables.userId],
        });
        queryClient.invalidateQueries({
          queryKey: ['quests', 'completion', variables.userId],
        });
        queryClient.invalidateQueries({
          queryKey: ['quests', 'score', variables.userId],
        });
        queryClient.invalidateQueries({
          queryKey: ['user', 'stats', variables.userId],
        });
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      }
    },
  });
}

/**
 * React Query mutation for completing quests with cache invalidation
 */
export function useCompleteQuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      questId,
      notes,
    }: {
      userId: string;
      questId: string;
      notes?: string;
    }) => completeQuest(userId, questId, notes),
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate related queries to refetch fresh data
        queryClient.invalidateQueries({
          queryKey: ['quests', 'current', variables.userId],
        });
        queryClient.invalidateQueries({
          queryKey: ['quests', 'completed', variables.userId],
        });
        queryClient.invalidateQueries({
          queryKey: ['quests', 'completion', variables.userId],
        });
        queryClient.invalidateQueries({
          queryKey: ['quests', 'score', variables.userId],
        });
        queryClient.invalidateQueries({
          queryKey: ['user', 'stats', variables.userId],
        });
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      }
    },
  });
}

/**
 * React Query mutation for assigning new quests with cache invalidation
 */
export function useAssignNewQuests() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignNewQuests,
    onSuccess: (data, userId) => {
      // Invalidate current quests to show new assignments
      queryClient.invalidateQueries({
        queryKey: ['quests', 'current', userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['quests', 'completion', userId],
      });
    },
  });
}
