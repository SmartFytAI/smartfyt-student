import { Journal } from '../../types';
import { apiClient } from '../api-client';
import { logger } from '../logger';

export interface CreateJournalData {
  userId: string;
  title: string;
  wentWell?: string;
  notWell?: string;
  goals?: string;
  sleepHours?: number;
  activeHours?: number;
  stress?: number;
  screenTime?: number;
  studyHours?: number;
  createdAt?: string; // Optional ISO date string for custom date
}

export interface JournalPaginationParams {
  limit?: number;
  offset?: number;
}

export interface JournalPaginationResponse {
  journals: Journal[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export class JournalService {
  /**
   * Get all journals for a user with pagination
   */
  static async getJournals(
    userId: string,
    pagination?: JournalPaginationParams
  ): Promise<JournalPaginationResponse> {
    try {
      logger.debug('📝 Fetching journals for user:', { userId, pagination });

      const params = new URLSearchParams();
      if (pagination?.limit)
        params.append('limit', pagination.limit.toString());
      if (pagination?.offset)
        params.append('offset', pagination.offset.toString());

      const response = await apiClient.getJournals(userId, params.toString());

      if (response.error) {
        logger.error('❌ Failed to fetch journals:', {
          error: response.error,
          userId,
        });
        throw new Error(response.error);
      }

      const data = response.data as JournalPaginationResponse;
      logger.debug('✅ Journals fetched successfully:', {
        count: data.journals.length,
        total: data.pagination.total,
        hasMore: data.pagination.hasMore,
        userId,
      });

      return data;
    } catch (error) {
      logger.error('❌ Journal service error:', { error, userId });
      throw error;
    }
  }

  /**
   * Get journal dates for a user
   */
  static async getJournalDates(userId: string): Promise<string[]> {
    try {
      logger.debug('📅 Fetching journal dates for user:', { userId });

      const response = await apiClient.getJournalDates(userId);

      if (response.error) {
        logger.error('❌ Failed to fetch journal dates:', {
          error: response.error,
          userId,
        });
        throw new Error(response.error);
      }

      // Convert timestamps to YYYY-MM-DD format for calendar comparison
      const dateStrings = (response.data || []).map((timestamp: string) => {
        const date = new Date(timestamp);
        return date.toISOString().split('T')[0];
      });

      logger.debug('✅ Journal dates fetched and converted successfully:', {
        count: dateStrings.length,
        userId,
      });

      return dateStrings;
    } catch (error) {
      logger.error('❌ Journal dates service error:', { error, userId });
      throw error;
    }
  }

  /**
   * Create a new journal entry
   */
  static async createJournal(data: CreateJournalData): Promise<Journal> {
    try {
      logger.debug('📝 Creating new journal entry:', {
        userId: data.userId,
        title: data.title,
      });

      const response = await apiClient.createJournal(data);

      if (response.error) {
        logger.error('❌ Failed to create journal:', {
          error: response.error,
          data,
        });
        throw new Error(response.error);
      }

      const journal = response.data as Journal;
      logger.debug('✅ Journal created successfully:', {
        journalId: journal.id,
        userId: data.userId,
      });

      return journal;
    } catch (error) {
      logger.error('❌ Create journal service error:', { error, data });
      throw error;
    }
  }

  /**
   * Check if user has completed a journal today
   */
  static async hasJournalToday(userId: string): Promise<boolean> {
    try {
      const response = await this.getJournals(userId);
      const today = new Date().toDateString();

      return response.journals.some(journal => {
        const journalDate = new Date(journal.createdAt).toDateString();
        return journalDate === today;
      });
    } catch (error) {
      logger.error("❌ Error checking today's journal:", { error, userId });
      return false;
    }
  }

  /**
   * Get the most recent journal entry
   */
  static async getLatestJournal(userId: string): Promise<Journal | null> {
    try {
      const response = await this.getJournals(userId);
      return response.journals.length > 0 ? response.journals[0] : null;
    } catch (error) {
      logger.error('❌ Error getting latest journal:', { error, userId });
      return null;
    }
  }

  /**
   * Check if user has a journal for a specific date
   */
  static async hasJournalForDate(userId: string, date: Date): Promise<boolean> {
    try {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      const response = await this.getJournals(userId);

      return response.journals.some(journal => {
        const journalDate = new Date(journal.createdAt);
        journalDate.setHours(0, 0, 0, 0);
        return journalDate.getTime() === targetDate.getTime();
      });
    } catch (error) {
      logger.error('❌ Error checking journal for date:', {
        error,
        userId,
        date,
      });
      return false;
    }
  }

  /**
   * Get journal for a specific date
   */
  static async getJournalForDate(
    userId: string,
    date: Date
  ): Promise<Journal | null> {
    try {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      const response = await this.getJournals(userId);

      const journal = response.journals.find(journal => {
        const journalDate = new Date(journal.createdAt);
        journalDate.setHours(0, 0, 0, 0);
        return journalDate.getTime() === targetDate.getTime();
      });

      return journal || null;
    } catch (error) {
      logger.error('❌ Error getting journal for date:', {
        error,
        userId,
        date,
      });
      return null;
    }
  }

  /**
   * Check if user has a journal for a specific date (efficient version using dates only)
   */
  static async hasJournalForDateEfficient(
    userId: string,
    date: Date
  ): Promise<boolean> {
    try {
      const targetDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      const journalDates = await this.getJournalDates(userId);

      logger.debug('📅 Checking journal existence:', {
        userId,
        targetDate,
        journalDatesCount: journalDates.length,
        sampleDates: journalDates.slice(0, 3),
      });

      return journalDates.includes(targetDate);
    } catch (error) {
      logger.error('❌ Error checking journal for date (efficient):', {
        error,
        userId,
        date: date.toISOString(),
      });
      return false;
    }
  }

  /**
   * Get journal for a specific date (efficient version)
   */
  static async getJournalForDateEfficient(
    userId: string,
    date: Date
  ): Promise<Journal | null> {
    try {
      // First check if a journal exists for this date using the efficient method
      const hasJournal = await this.hasJournalForDateEfficient(userId, date);

      if (!hasJournal) {
        logger.debug('📅 No journal found for date (efficient check):', {
          userId,
          date: date.toISOString(),
        });
        return null;
      }

      // Use the new API endpoint to get the specific journal for this date
      const targetDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      logger.debug('📅 Fetching journal for date:', {
        userId,
        date: targetDate,
        originalDate: date.toISOString(),
      });

      const response = await apiClient.getJournalForDate(userId, targetDate);

      if (response.error) {
        logger.error('❌ Failed to fetch journal for date:', {
          error: response.error,
          userId,
          date: targetDate,
          status: response.status,
        });
        return null;
      }

      const journal = response.data as Journal;
      logger.debug('✅ Journal for date fetched successfully:', {
        journalId: journal.id,
        userId,
        date: targetDate,
        journalCreatedAt: journal.createdAt,
      });

      return journal;
    } catch (error) {
      logger.error('❌ Error getting journal for date (efficient):', {
        error,
        userId,
        date: date.toISOString(),
      });
      return null;
    }
  }
}
