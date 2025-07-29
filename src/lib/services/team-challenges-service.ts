import { logger } from '@/lib/logger';
import { ApiClient } from '@/lib/api-client';

import { NotificationService } from './notification-service';

// Create API client instance
const apiClient = new ApiClient();

// Types for team challenges
export interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  type: 'step_competition' | 'workout' | 'habit' | 'skill' | 'team_building';
  duration: number; // days
  createdBy: string;
  teamId: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  participants?: TeamChallengeParticipant[];
}

export interface TeamChallengeParticipant {
  id: string;
  challengeId: string;
  userId: string;
  status: 'invited' | 'accepted' | 'declined' | 'completed';
  joinedAt?: string;
  completedAt?: string;
  score: number;
}

export interface TeamRecognition {
  id: string;
  fromUserId: string;
  toUserId: string;
  teamId: string;
  type: 'clap' | 'fire' | 'heart' | 'flex' | 'zap' | 'trophy';
  message?: string;
  createdAt: string;
  fromUser?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  toUser?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

export interface UserRecognitionLimit {
  id: string;
  userId: string;
  date: string;
  clapsUsed: number;
  firesUsed: number;
  heartsUsed: number;
  flexesUsed: number;
  zapsUsed: number;
  trophiesUsed: number;
}

export interface CreateChallengeData {
  title: string;
  description: string;
  type: 'step_competition' | 'workout' | 'habit' | 'skill' | 'team_building';
  duration: number;
  teamId: string;
  userIds: string[];
}

export interface RecognitionData {
  fromUserId: string;
  toUserId: string;
  teamId: string;
  type: 'clap' | 'fire' | 'heart' | 'flex' | 'zap' | 'trophy';
  message?: string;
}

export interface TeamChallengesServiceResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export interface CategorizedChallenges {
  activeChallenges: TeamChallenge[];
  availableChallenges: TeamChallenge[];
}

export interface ChallengeWithParticipation extends TeamChallenge {
  isParticipating: boolean;
  participationStatus?: 'invited' | 'accepted' | 'declined' | 'completed';
}

export class TeamChallengesService {
  /**
   * Categorize challenges into active (participating) and available (not participating)
   */
  static categorizeChallenges(
    challenges: TeamChallenge[],
    currentUserId: string
  ): CategorizedChallenges {
    const challengesWithParticipation: ChallengeWithParticipation[] =
      challenges.map(challenge => {
        const isParticipating =
          challenge.participants?.some(
            participant => participant.userId === currentUserId
          ) || false;

        const participationStatus = challenge.participants?.find(
          participant => participant.userId === currentUserId
        )?.status;

        return {
          ...challenge,
          isParticipating,
          participationStatus,
        };
      });

    // Sort by end date (earliest first for active challenges)
    const sortedChallenges = challengesWithParticipation.sort((a, b) => {
      const aEndDate = new Date(a.endDate);
      const bEndDate = new Date(b.endDate);
      return aEndDate.getTime() - bEndDate.getTime();
    });

    const activeChallenges = sortedChallenges.filter(
      challenge =>
        challenge.participationStatus === 'accepted' && challenge.isActive
    );

    const availableChallenges = sortedChallenges.filter(
      challenge =>
        (challenge.participationStatus === 'invited' ||
          !challenge.participationStatus) &&
        challenge.isActive
    );

    return {
      activeChallenges,
      availableChallenges,
    };
  }
  // Team Challenges Methods

  static async getTeamChallenges(
    teamId: string
  ): Promise<TeamChallengesServiceResponse<TeamChallenge[]>> {
    try {
      logger.info('Fetching team challenges', { teamId });

      const response = await apiClient.getTeamChallenges(teamId);

      // Handle API response structure: { success: true, data: challenges[] }
      if (response.error) {
        return {
          data: null,
          error: response.error,
          isLoading: false,
        };
      }

      const challenges = (response.data as any)?.data || response.data || [];

      return {
        data: challenges as TeamChallenge[],
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error('Failed to fetch team challenges', { error, teamId });
      return {
        data: null,
        error: 'Failed to fetch team challenges',
        isLoading: false,
      };
    }
  }

  static async createChallenge(
    data: CreateChallengeData
  ): Promise<TeamChallengesServiceResponse<TeamChallenge>> {
    try {
      logger.info('Creating team challenge', { data });

      const response = await apiClient.createTeamChallenge(data.teamId, data);

      if (response.error) {
        return {
          data: null,
          error: response.error,
          isLoading: false,
        };
      }

      const challenge = (response.data as any)?.data || response.data;
      return {
        data: challenge as TeamChallenge,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error('Failed to create team challenge', { error, data });
      return {
        data: null,
        error: 'Failed to create team challenge',
        isLoading: false,
      };
    }
  }

  // Team Recognition Methods

  static async getTeamRecognitions(
    teamId: string
  ): Promise<TeamChallengesServiceResponse<TeamRecognition[]>> {
    try {
      logger.info('Fetching team recognitions', { teamId });

      const response = await apiClient.getTeamRecognitions(teamId);

      if (response.error) {
        return {
          data: null,
          error: response.error,
          isLoading: false,
        };
      }

      const recognitions = (response.data as any)?.data || response.data || [];
      return {
        data: recognitions as TeamRecognition[],
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error('Failed to fetch team recognitions', { error, teamId });
      return {
        data: null,
        error: 'Failed to fetch team recognitions',
        isLoading: false,
      };
    }
  }

  static async giveRecognition(
    data: RecognitionData
  ): Promise<TeamChallengesServiceResponse<TeamRecognition>> {
    try {
      logger.info('Giving recognition', { data });

      const response = await apiClient.giveRecognition(data.teamId, data);

      if (response.error) {
        return {
          data: null,
          error: response.error,
          isLoading: false,
        };
      }

      const recognition = (response.data as any)?.data || response.data;
      return {
        data: recognition as TeamRecognition,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error('Failed to give recognition', { error, data });
      return {
        data: null,
        error: 'Failed to give recognition',
        isLoading: false,
      };
    }
  }

  static async getUserRecognitionLimits(
    userId: string,
    date: Date
  ): Promise<TeamChallengesServiceResponse<UserRecognitionLimit>> {
    try {
      logger.info('Fetching user recognition limits', { userId, date });

      const dateString = date.toISOString().split('T')[0];
      const response = await apiClient.getUserRecognitionLimits(
        userId,
        dateString
      );

      if (response.error) {
        return {
          data: null,
          error: response.error,
          isLoading: false,
        };
      }

      const limits = (response.data as any)?.data || response.data;
      return {
        data: limits as UserRecognitionLimit,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error('Failed to fetch user recognition limits', {
        error,
        userId,
        date,
      });
      return {
        data: null,
        error: 'Failed to fetch user recognition limits',
        isLoading: false,
      };
    }
  }

  static async checkRecognitionLimit(
    userId: string,
    type: string
  ): Promise<boolean> {
    try {
      logger.info('Checking recognition limit', { userId, type });

      const response = await apiClient.getUserRecognitionLimits(
        userId,
        new Date().toISOString().split('T')[0]
      );

      if (response.error) {
        return false;
      }

      const limits =
        (response.data as any)?.data || (response.data as UserRecognitionLimit);
      const limitField = `${type}sUsed` as keyof UserRecognitionLimit;
      return (limits[limitField] as number) < 5; // Daily limit per type
    } catch (error) {
      logger.error('Failed to check recognition limit', {
        error,
        userId,
        type,
      });
      return false;
    }
  }

  /**
   * Join a team challenge
   */
  static async joinChallenge(
    challengeId: string,
    userId: string,
    teamId: string
  ): Promise<TeamChallengesServiceResponse<TeamChallengeParticipant>> {
    try {
      logger.info('Joining team challenge', { challengeId, userId, teamId });

      const response = await apiClient.joinTeamChallenge(
        teamId,
        challengeId,
        userId
      );

      if (response.error) {
        return {
          data: null,
          error: response.error,
          isLoading: false,
        };
      }

      const participant = (response.data as any)?.data || response.data;
      return {
        data: participant as TeamChallengeParticipant,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error('Failed to join team challenge', {
        error,
        challengeId,
        userId,
        teamId,
      });
      return {
        data: null,
        error: 'Failed to join team challenge',
        isLoading: false,
      };
    }
  }
}
