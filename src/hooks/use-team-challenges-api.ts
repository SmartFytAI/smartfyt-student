import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  TeamChallengesService,
  type CreateChallengeData,
  type RecognitionData,
} from '@/lib/services/team-challenges-service';

// Query keys
export const teamChallengesQueryKeys = {
  teamChallenges: (teamId: string) => ['team-challenges', 'challenges', teamId],
  teamRecognitions: (teamId: string) => [
    'team-challenges',
    'recognitions',
    teamId,
  ],
  userRecognitionLimits: (userId: string, date: string) => [
    'team-challenges',
    'recognition-limits',
    userId,
    date,
  ],
};

/**
 * Hook to get team challenges
 */
export function useTeamChallenges(teamId: string | null) {
  return useQuery({
    queryKey: teamChallengesQueryKeys.teamChallenges(teamId || ''),
    queryFn: () => TeamChallengesService.getTeamChallenges(teamId || ''),
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get team recognitions
 */
export function useTeamRecognitions(teamId: string | null) {
  return useQuery({
    queryKey: teamChallengesQueryKeys.teamRecognitions(teamId || ''),
    queryFn: () => TeamChallengesService.getTeamRecognitions(teamId || ''),
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get user recognition limits
 */
export function useUserRecognitionLimits(userId: string | null, date: Date) {
  const dateString = date.toISOString().split('T')[0];

  return useQuery({
    queryKey: teamChallengesQueryKeys.userRecognitionLimits(
      userId || '',
      dateString
    ),
    queryFn: () =>
      TeamChallengesService.getUserRecognitionLimits(userId || '', date),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a team challenge
 */
export function useCreateTeamChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChallengeData) =>
      TeamChallengesService.createChallenge(data),
    onSuccess: (result, variables) => {
      if (result.data) {
        // Invalidate team challenges query
        queryClient.invalidateQueries({
          queryKey: teamChallengesQueryKeys.teamChallenges(variables.teamId),
        });
      }
    },
  });
}

/**
 * Hook to give recognition
 */
export function useGiveRecognition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecognitionData) =>
      TeamChallengesService.giveRecognition(data),
    onSuccess: (result, variables) => {
      if (result.data) {
        // Invalidate team recognitions query
        queryClient.invalidateQueries({
          queryKey: teamChallengesQueryKeys.teamRecognitions(variables.teamId),
        });

        // Invalidate user recognition limits
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        queryClient.invalidateQueries({
          queryKey: teamChallengesQueryKeys.userRecognitionLimits(
            variables.fromUserId,
            dateString
          ),
        });
      }
    },
  });
}

/**
 * Hook to check recognition limit
 */
export function useCheckRecognitionLimit() {
  return useMutation({
    mutationFn: (data: { userId: string; type: string }) =>
      TeamChallengesService.checkRecognitionLimit(data.userId, data.type),
  });
}

/**
 * Hook to invalidate all team challenges queries
 */
export function useInvalidateTeamChallengesQueries() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: ['team-challenges'],
    });
  };
}
