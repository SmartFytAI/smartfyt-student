import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import { UserStat, QuestResponse } from '@/types';

export class QuestService {
  /**
   * Get all quests for a user
   */
  static async getUserQuests(userId: string): Promise<QuestResponse[]> {
    try {
      logger.debug('⚔️ Fetching user quests:', { userId });
      const response = await apiClient.getUserQuests(userId);
      
      if (response.error) {
        logger.error('❌ Failed to fetch user quests:', response.error);
        throw new Error(response.error);
      }

      logger.debug('✅ User quests fetched successfully:', {
        count: Array.isArray(response.data) ? response.data.length : 0,
      });
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      logger.error('❌ Error fetching user quests:', error);
      throw error;
    }
  }

  /**
   * Get user stats for all categories
   */
  static async getUserStats(userId: string): Promise<UserStat[]> {
    try {
      logger.debug('📊 Fetching user stats:', { userId });
      const response = await apiClient.getUserStats(userId);
      
      if (response.error) {
        logger.error('❌ Failed to fetch user stats:', response.error);
        throw new Error(response.error);
      }

      logger.debug('✅ User stats fetched successfully:', {
        count: Array.isArray(response.data) ? response.data.length : 0,
      });
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      logger.error('❌ Error fetching user stats:', error);
      throw error;
    }
  }

  /**
   * Complete a quest with notes
   */
  static async completeQuest(
    userId: string,
    questId: string,
    notes: string
  ): Promise<{ updatedStats: UserStat[]; remainingQuests: QuestResponse[] }> {
    try {
      logger.debug('⚔️ Completing quest:', { userId, questId, notesLength: notes.length });
      
      if (!notes || notes.trim().length === 0) {
        throw new Error('Completion notes are required');
      }

      if (notes.length > 280) {
        throw new Error('Completion notes must be 280 characters or less');
      }

      const response = await apiClient.completeQuest(userId, questId, notes);
      
      if (response.error) {
        logger.error('❌ Failed to complete quest:', response.error);
        throw new Error(response.error);
      }

      logger.debug('✅ Quest completed successfully:', {
        questId,
        pointsEarned: (response.data as any)?.pointsEarned,
      });
      
      return (response.data as { updatedStats: UserStat[]; remainingQuests: QuestResponse[] }) || { updatedStats: [], remainingQuests: [] };
    } catch (error) {
      logger.error('❌ Error completing quest:', error);
      throw error;
    }
  }

  /**
   * Get completed quests for a user
   */
  static async getCompletedQuests(userId: string): Promise<QuestResponse[]> {
    try {
      logger.debug('🏆 Fetching completed quests:', { userId });
      const response = await apiClient.getCompletedQuests(userId);
      
      if (response.error) {
        logger.error('❌ Failed to fetch completed quests:', response.error);
        throw new Error(response.error);
      }

      logger.debug('✅ Completed quests fetched successfully:', {
        count: Array.isArray(response.data) ? response.data.length : 0,
      });
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      logger.error('❌ Error fetching completed quests:', error);
      throw error;
    }
  }

  /**
   * Get quest categories
   */
  static async getQuestCategories(): Promise<any[]> {
    try {
      logger.debug('📂 Fetching quest categories');
      const response = await apiClient.getQuestCategories();
      
      if (response.error) {
        logger.error('❌ Failed to fetch quest categories:', response.error);
        throw new Error(response.error);
      }

      logger.debug('✅ Quest categories fetched successfully:', {
        count: Array.isArray(response.data) ? response.data.length : 0,
      });
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      logger.error('❌ Error fetching quest categories:', error);
      throw error;
    }
  }
} 