import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
      logger.error('❌ Journal service error:', { error, userId });
      throw error;
    }
  }

  /**
   * Create a new journal entry
   */
  static async createJournal(data: CreateJournalData): Promise<Journal> {
    try {
      logger.debug('📝 Creating journal for user:', {
        userId: data.userId,
        title: data.title,
      });

      const response = await apiClient.createJournal(data);

      if (response.error) {
        logger.error('❌ Failed to create journal:', {
          error: response.error,
          userId: data.userId,
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
      logger.error('❌ Journal service error:', { error, userId: data.userId });
      throw error;
    }
  }

  /**
   * Check if user has a journal for today
   */
  static async hasJournalToday(userId: string): Promise<boolean> {
    try {
      logger.debug('📅 Checking if user has journal today:', { userId });

      const today = new Date();
      const hasJournal = await this.hasJournalForDate(userId, today);

      logger.debug('✅ Journal today check completed:', {
        hasJournal,
        userId,
      });

      return hasJournal;
    } catch (error) {
      logger.error('❌ Journal service error:', { error, userId });
      throw error;
    }
  }

  /**
   * Get the latest journal for a user
   */
  static async getLatestJournal(userId: string): Promise<Journal | null> {
    try {
      logger.debug('📝 Fetching latest journal for user:', { userId });

      const response = await this.getJournals(userId, { limit: 1 });

      const latestJournal = response.journals[0] || null;

      logger.debug('✅ Latest journal fetched:', {
        hasJournal: !!latestJournal,
        journalId: latestJournal?.id,
        userId,
      });

      return latestJournal;
    } catch (error) {
      logger.error('❌ Journal service error:', { error, userId });
      throw error;
    }
  }

  /**
   * Check if user has a journal for a specific date
   */
  static async hasJournalForDate(userId: string, date: Date): Promise<boolean> {
    try {
      logger.debug('📅 Checking if user has journal for date:', {
        userId,
        date: date.toISOString().split('T')[0],
      });

      const dateString = date.toISOString().split('T')[0];
      const journalDates = await this.getJournalDates(userId);

      const hasJournal = journalDates.includes(dateString);

      logger.debug('✅ Journal date check completed:', {
        hasJournal,
        date: dateString,
        userId,
      });

      return hasJournal;
    } catch (error) {
      logger.error('❌ Journal service error:', { error, userId });
      throw error;
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
      logger.debug('📝 Fetching journal for specific date:', {
        userId,
        date: date.toISOString().split('T')[0],
      });

      const hasJournal = await this.hasJournalForDate(userId, date);

      if (!hasJournal) {
        logger.debug('✅ No journal found for date:', {
          date: date.toISOString().split('T')[0],
          userId,
        });
        return null;
      }

      // Get all journals and find the one for the specific date
      const response = await this.getJournals(userId);
      const dateString = date.toISOString().split('T')[0];

      const journal = response.journals.find(j => {
        const journalDate = new Date(j.createdAt);
        const journalDateString = journalDate.toISOString().split('T')[0];
        return journalDateString === dateString;
      });

      logger.debug('✅ Journal for date fetched:', {
        found: !!journal,
        journalId: journal?.id,
        date: dateString,
        userId,
      });

      return journal || null;
    } catch (error) {
      logger.error('❌ Journal service error:', { error, userId });
      throw error;
    }
  }

  /**
   * Efficient check if user has a journal for a specific date
   * Uses the journal dates endpoint directly
   */
  static async hasJournalForDateEfficient(
    userId: string,
    date: Date
  ): Promise<boolean> {
    try {
      logger.debug('📅 Efficient check for journal date:', {
        userId,
        date: date.toISOString().split('T')[0],
      });

      const dateString = date.toISOString().split('T')[0];
      const journalDates = await this.getJournalDates(userId);

      const hasJournal = journalDates.includes(dateString);

      logger.debug('✅ Efficient journal date check completed:', {
        hasJournal,
        date: dateString,
        userId,
      });

      return hasJournal;
    } catch (error) {
      logger.error('❌ Journal service error:', { error, userId });
      throw error;
    }
  }

  /**
   * Efficient get journal for a specific date
   * Uses the journal dates endpoint to check first, then fetches if exists
   */
  static async getJournalForDateEfficient(
    userId: string,
    date: Date
  ): Promise<Journal | null> {
    try {
      logger.debug('📝 Efficient journal fetch for date:', {
        userId,
        date: date.toISOString().split('T')[0],
      });

      const hasJournal = await this.hasJournalForDateEfficient(userId, date);

      if (!hasJournal) {
        logger.debug('✅ No journal found for date (efficient check):', {
          date: date.toISOString().split('T')[0],
          userId,
        });
        return null;
      }

      // Get all journals and find the one for the specific date
      const response = await this.getJournals(userId);
      const dateString = date.toISOString().split('T')[0];

      const journal = response.journals.find(j => {
        const journalDate = new Date(j.createdAt);
        const journalDateString = journalDate.toISOString().split('T')[0];
        return journalDateString === dateString;
      });

      logger.debug('✅ Journal for date fetched (efficient):', {
        found: !!journal,
        journalId: journal?.id,
        date: dateString,
        userId,
      });

      return journal || null;
    } catch (error) {
      logger.error('❌ Journal service error:', { error, userId });
      throw error;
    }
  }
}

// ============================================================================
// React Query Hooks for Caching
// ============================================================================

/**
 * React Query hook for journals with pagination and caching
 */
export function useJournals(
  userId: string | null,
  pagination?: JournalPaginationParams
) {
  return useQuery({
    queryKey: ['journals', userId, pagination],
    queryFn: () => JournalService.getJournals(userId!, pagination),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * React Query hook for journal dates with caching
 */
export function useJournalDates(userId: string | null) {
  return useQuery({
    queryKey: ['journals', 'dates', userId],
    queryFn: () => JournalService.getJournalDates(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes (dates change less often)
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * React Query hook for latest journal with caching
 */
export function useLatestJournal(userId: string | null) {
  return useQuery({
    queryKey: ['journals', 'latest', userId],
    queryFn: () => JournalService.getLatestJournal(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * React Query hook for journal for specific date with caching
 */
export function useJournalForDate(userId: string | null, date: Date | null) {
  return useQuery({
    queryKey: ['journals', 'date', userId, date?.toISOString().split('T')[0]],
    queryFn: () => JournalService.getJournalForDateEfficient(userId!, date!),
    enabled: !!userId && !!date,
    staleTime: 5 * 60 * 1000, // 5 minutes (journal content doesn't change often)
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * React Query hook for checking if journal exists for date with caching
 */
export function useHasJournalForDate(userId: string | null, date: Date | null) {
  return useQuery({
    queryKey: ['journals', 'has', userId, date?.toISOString().split('T')[0]],
    queryFn: () => JournalService.hasJournalForDateEfficient(userId!, date!),
    enabled: !!userId && !!date,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * React Query hook for checking if user has journal today with caching
 */
export function useHasJournalToday(userId: string | null) {
  return useQuery({
    queryKey: ['journals', 'today', userId],
    queryFn: () => JournalService.hasJournalToday(userId!),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute (today status changes frequently)
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * React Query mutation for creating journals with cache invalidation
 */
export function useCreateJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJournalData) => JournalService.createJournal(data),
    onSuccess: (data, variables) => {
      // Invalidate related queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ['journals', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['journals', 'dates', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['journals', 'latest', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['journals', 'today', variables.userId],
      });

      // Invalidate specific date queries
      if (variables.createdAt) {
        const dateString = new Date(variables.createdAt)
          .toISOString()
          .split('T')[0];
        queryClient.invalidateQueries({
          queryKey: ['journals', 'date', variables.userId, dateString],
        });
        queryClient.invalidateQueries({
          queryKey: ['journals', 'has', variables.userId, dateString],
        });
      } else {
        // If no specific date, invalidate today's queries
        const todayString = new Date().toISOString().split('T')[0];
        queryClient.invalidateQueries({
          queryKey: ['journals', 'date', variables.userId, todayString],
        });
        queryClient.invalidateQueries({
          queryKey: ['journals', 'has', variables.userId, todayString],
        });
      }
    },
  });
}
