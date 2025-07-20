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

export class JournalService {
  /**
   * Get all journals for a user
   */
  static async getJournals(userId: string): Promise<Journal[]> {
    try {
      logger.debug('📝 Fetching journals for user:', { userId });

      const response = await apiClient.getJournals(userId);

      if (response.error) {
        logger.error('❌ Failed to fetch journals:', {
          error: response.error,
          userId,
        });
        throw new Error(response.error);
      }

      const journals = (response.data as Journal[]) || [];
      logger.debug('✅ Journals fetched successfully:', {
        count: journals.length,
        userId,
      });

      return journals;
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
      const journals = await this.getJournals(userId);
      const today = new Date().toDateString();

      return journals.some(journal => {
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
      const journals = await this.getJournals(userId);
      return journals.length > 0 ? journals[0] : null;
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

      const journals = await this.getJournals(userId);

      return journals.some(journal => {
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

      const journals = await this.getJournals(userId);

      const journal = journals.find(journal => {
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
}
