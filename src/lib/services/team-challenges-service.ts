import { logger } from '@/lib/logger';

import { NotificationService } from './notification-service';

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

// Mock data for development
const mockTeamChallenges: TeamChallenge[] = [
  {
    id: 'challenge-1',
    title: 'Step Competition',
    description: 'Who can get the most steps this week?',
    type: 'step_competition',
    duration: 7,
    createdBy: 'user-1',
    teamId: 'team-1',
    isActive: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'challenge-2',
    title: 'Workout Warriors',
    description: 'Complete 3 workouts this week',
    type: 'workout',
    duration: 7,
    createdBy: 'user-2',
    teamId: 'team-1',
    isActive: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockTeamRecognitions: TeamRecognition[] = [
  {
    id: 'recognition-1',
    fromUserId: 'user-1',
    toUserId: 'user-2',
    teamId: 'team-1',
    type: 'clap',
    message: 'Great job on the workout today!',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'recognition-2',
    fromUserId: 'user-2',
    toUserId: 'user-3',
    teamId: 'team-1',
    type: 'fire',
    message: 'You crushed that challenge!',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'recognition-3',
    fromUserId: 'user-3',
    toUserId: 'user-1',
    teamId: 'team-1',
    type: 'heart',
    message: 'Thanks for being such a great teammate!',
    createdAt: new Date().toISOString(),
  },
];

const mockUserRecognitionLimits: UserRecognitionLimit = {
  id: 'limit-1',
  userId: 'user-1',
  date: new Date().toISOString().split('T')[0],
  clapsUsed: 2,
  firesUsed: 1,
  heartsUsed: 3,
  flexesUsed: 0,
  zapsUsed: 1,
  trophiesUsed: 0,
};

export class TeamChallengesService {
  // Team Challenges Methods

  static async getTeamChallenges(
    teamId: string
  ): Promise<TeamChallengesServiceResponse<TeamChallenge[]>> {
    try {
      logger.info('Fetching team challenges', { teamId });

      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/teams/${teamId}/challenges`);
      // return { data: response.data, error: null, isLoading: false };

      // Mock response for development
      const challenges = mockTeamChallenges.filter(
        challenge => challenge.teamId === teamId
      );

      return {
        data: challenges,
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

      // TODO: Replace with actual API call
      // const response = await apiClient.post(`/teams/${data.teamId}/challenges`, data);
      // return { data: response.data, error: null, isLoading: false };

      // Mock response for development
      const newChallenge: TeamChallenge = {
        id: `challenge-${Date.now()}`,
        title: data.title,
        description: data.description,
        type: data.type,
        duration: data.duration,
        createdBy: data.userIds[0] || 'system',
        teamId: data.teamId,
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(
          Date.now() + data.duration * 24 * 60 * 60 * 1000
        ).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to mock data
      mockTeamChallenges.push(newChallenge);

      // Create notifications for team members (skip creator)
      const notificationPromises = data.userIds
        .filter(userId => userId !== newChallenge.createdBy)
        .map(userId =>
          NotificationService.createNotification({
            userId,
            message: `New team challenge: ${newChallenge.title}`,
            type: 'team_challenge',
            link: `/team-challenges?tab=challenges`,
            actorId: newChallenge.createdBy,
          })
        );

      if (notificationPromises.length > 0) {
        await Promise.all(notificationPromises);
      }

      return {
        data: newChallenge,
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

      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/teams/${teamId}/recognitions`);
      // return { data: response.data, error: null, isLoading: false };

      // Mock response for development
      const recognitions = mockTeamRecognitions.filter(
        recognition => recognition.teamId === teamId
      );

      return {
        data: recognitions,
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

      // TODO: Replace with actual API call
      // const response = await apiClient.post(`/teams/${data.teamId}/recognitions`, data);
      // return { data: response.data, error: null, isLoading: false };

      // Mock response for development
      const newRecognition: TeamRecognition = {
        id: `recognition-${Date.now()}`,
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        teamId: data.teamId,
        type: data.type,
        message: data.message,
        createdAt: new Date().toISOString(),
      };

      // Add to mock data
      mockTeamRecognitions.push(newRecognition);

      // Create notification for recipient
      await NotificationService.createNotification({
        userId: data.toUserId,
        message: `You received a ${data.type} recognition!`,
        type: 'team_recognition',
        link: `/team-challenges?tab=recognition`,
        actorId: data.fromUserId,
      });

      return {
        data: newRecognition,
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

      // TODO: Replace with actual API call
      // const dateString = date.toISOString().split('T')[0];
      // const response = await apiClient.get(`/users/${userId}/recognition-limits?date=${dateString}`);
      // return { data: response.data, error: null, isLoading: false };

      // Mock response for development
      const dateString = date.toISOString().split('T')[0];
      const limits =
        mockUserRecognitionLimits.userId === userId &&
        mockUserRecognitionLimits.date === dateString
          ? mockUserRecognitionLimits
          : {
              id: `limit-${userId}-${dateString}`,
              userId,
              date: dateString,
              clapsUsed: 0,
              firesUsed: 0,
              heartsUsed: 0,
              flexesUsed: 0,
              zapsUsed: 0,
              trophiesUsed: 0,
            };

      return {
        data: limits,
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

      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/users/${userId}/recognition-limits`);
      // const limits = response.data;
      // const limitField = `${type}sUsed`;
      // return limits[limitField] < 5; // Daily limit per type

      // Mock response for development
      const limits = mockUserRecognitionLimits;
      const limitField = `${type}sUsed` as keyof UserRecognitionLimit;
      const currentCount = limits[limitField] as number;
      const maxLimit = 5; // Daily limit per type

      return currentCount < maxLimit;
    } catch (error) {
      logger.error('Failed to check recognition limit', {
        error,
        userId,
        type,
      });
      return false;
    }
  }
}
