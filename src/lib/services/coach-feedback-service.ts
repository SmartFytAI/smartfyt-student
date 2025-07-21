import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { logger } from '@/lib/logger';

export interface CoachFeedback {
  id: string;
  coachName: string;
  message: string;
  date: string;
  type: 'positive' | 'improvement' | 'general';
  isRead: boolean;
}

export interface CoachFeedbackResponse {
  data: CoachFeedback[];
  error: string | null;
  isLoading: boolean;
}

/**
 * React Query hook for coach feedback with caching
 */
export function useCoachFeedback(userId: string | null) {
  return useQuery({
    queryKey: ['coach-feedback', userId],
    queryFn: () => CoachFeedbackService.getCoachFeedback(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * React Query mutation for marking feedback as read with cache invalidation
 */
export function useMarkFeedbackAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      feedbackId,
    }: {
      userId: string;
      feedbackId: string;
    }) => CoachFeedbackService.markAsRead(userId, feedbackId),
    onSuccess: (data, variables) => {
      // Invalidate related queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ['coach-feedback', variables.userId],
      });
    },
  });
}

// ============================================================================
// Original Service Class
// ============================================================================

/**
 * Coach Feedback Service - Handles all coach feedback API calls
 */
export class CoachFeedbackService {
  /**
   * Get coach feedback for a user
   */
  static async getCoachFeedback(
    userId: string
  ): Promise<CoachFeedbackResponse> {
    try {
      logger.debug('CoachFeedbackService: Fetching coach feedback', { userId });

      // TODO: Replace with actual API call when backend is ready
      // For now, return mock data
      const mockFeedback: CoachFeedback[] = [
        {
          id: '1',
          coachName: 'SmartFyt Coach',
          message:
            'Great job on your rest day! Remember, recovery is just as important as training. Your body needs time to rebuild and get stronger.',
          date: '2024-01-15',
          type: 'positive',
          isRead: false,
        },
        {
          id: '2',
          coachName: 'SmartFyt Coach',
          message:
            'I noticed you completed your study session today. Keep up the academic focus - it shows great discipline and balance between sports and school.',
          date: '2024-01-14',
          type: 'positive',
          isRead: true,
        },
        {
          id: '3',
          coachName: 'Coach Johnson',
          message:
            "Your sprint times are improving! Focus on maintaining that explosive start. Let's work on your acceleration in the next practice.",
          date: '2024-01-13',
          type: 'improvement',
          isRead: true,
        },
      ];

      logger.info('CoachFeedbackService: Successfully fetched coach feedback', {
        userId,
        feedbackCount: mockFeedback.length,
      });

      return {
        data: mockFeedback,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error('CoachFeedbackService: Error fetching coach feedback', {
        userId,
        error,
      });
      return {
        data: [],
        error: 'Failed to load coach feedback',
        isLoading: false,
      };
    }
  }

  /**
   * Mark feedback as read
   */
  static async markAsRead(
    userId: string,
    feedbackId: string
  ): Promise<{ success: boolean }> {
    try {
      logger.debug('CoachFeedbackService: Marking feedback as read', {
        userId,
        feedbackId,
      });

      // TODO: Replace with actual API call when backend is ready
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 100));

      logger.info(
        'CoachFeedbackService: Successfully marked feedback as read',
        {
          userId,
          feedbackId,
        }
      );

      return { success: true };
    } catch (error) {
      logger.error('CoachFeedbackService: Error marking feedback as read', {
        userId,
        feedbackId,
        error,
      });
      throw new Error('Failed to mark feedback as read');
    }
  }
}
