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

    const quests = response.data || [];
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

    const quests = response.data || [];
    logger.debug('✅ Found completed quests:', quests.length);
    return quests;
  } catch (error) {
    logger.error('❌ Error fetching completed quests:', error);
    return [];
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

    const stats = response.data || [];
    logger.debug('✅ Found user stats:', stats.length);
    return stats;
  } catch (error) {
    logger.error('❌ Error fetching user stats:', error);
    return [];
  }
}

/**
 * Complete a quest
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

    logger.debug('✅ Quest completed successfully');
    return {
      success: true,
      // Note: The API response structure may need to be updated to include these fields
      points: 0,
      newLevel: 1,
      totalPoints: 0,
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
    logger.debug('🎲 Assigning new quests for user:', userId);

    const response = await apiClient.assignQuests(userId);

    if (response.error) {
      logger.error('❌ Failed to assign quests:', response.error);
      return [];
    }

    const quests = response.data || [];
    logger.debug('✅ New quests assigned:', quests.length);
    return quests;
  } catch (error) {
    logger.error('❌ Error assigning quests:', error);
    return [];
  }
}

/**
 * Get quest completion statistics
 */
export async function getQuestCompletion(
  userId: string
): Promise<QuestCompletion> {
  try {
    logger.debug('📊 Getting quest completion stats for user:', userId);

    const [currentQuests, completedQuests] = await Promise.all([
      getCurrentQuests(userId),
      getCompletedQuests(userId),
    ]);

    const totalQuests = currentQuests.length + completedQuests.length;
    const completedCount = completedQuests.length;
    const percentage =
      totalQuests > 0 ? Math.round((completedCount / totalQuests) * 100) : 0;

    logger.debug('✅ Quest completion stats:', {
      totalQuests,
      completedCount,
      percentage,
    });

    return {
      totalQuests,
      completedQuests: completedCount,
      percentage,
    };
  } catch (error) {
    logger.error('❌ Error getting quest completion:', error);
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
    logger.debug('✅ Found team leaderboard:', leaderboard.length);
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
    logger.debug('✅ Found school leaderboard:', leaderboard.length);
    return leaderboard;
  } catch (error) {
    logger.error('❌ Error fetching school leaderboard:', error);
    return [];
  }
}

/**
 * Get all leaderboard data (team and school)
 */
export async function getQuestLeaderboard(
  userId: string,
  teamId?: string
): Promise<QuestLeaderboard> {
  try {
    logger.debug('🏆 Fetching quest leaderboard data:', { userId, teamId });

    const [schoolLeaderboard, teamLeaderboard] = await Promise.all([
      getSchoolLeaderboard(userId),
      teamId ? getTeamLeaderboard(teamId) : Promise.resolve([]),
    ]);

    logger.debug('✅ Quest leaderboard data fetched:', {
      school: schoolLeaderboard.length,
      team: teamLeaderboard.length,
    });

    return {
      teamLeaderboard,
      schoolLeaderboard,
    };
  } catch (error) {
    logger.error('❌ Error fetching quest leaderboard:', error);
    return {
      teamLeaderboard: [],
      schoolLeaderboard: [],
    };
  }
}

/**
 * Get user's total quest score across all categories
 */
export async function getTotalQuestScore(userId: string): Promise<number> {
  try {
    logger.debug('📊 Getting total quest score for user:', userId);

    const stats = await getUserStats(userId);
    const totalScore = stats.reduce((sum, stat) => sum + stat.points, 0);

    logger.debug('✅ Total quest score:', totalScore);
    return totalScore;
  } catch (error) {
    logger.error('❌ Error getting total quest score:', error);
    return 0;
  }
}
