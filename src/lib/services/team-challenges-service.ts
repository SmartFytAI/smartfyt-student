import { logger } from '@/lib/logger';

import { NotificationService } from './notification-service';

// Types for team challenges
export interface TeamQuest {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pointValue: number;
  duration: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  teamId: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamQuestAssignment {
  id: string;
  questId: string;
  userId: string;
  assignedAt: string;
  status: 'assigned' | 'accepted' | 'declined' | 'completed';
}

export interface TeamQuestCompletion {
  id: string;
  questId: string;
  userId: string;
  completedAt: string;
  notes?: string;
  evidence?: string;
}

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

export interface CreateQuestData {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pointValue: number;
  duration: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  teamId: string;
  userIds: string[];
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

// Mock data
const mockTeamQuests: TeamQuest[] = [
  {
    id: 'quest-1',
    title: 'Weekly Step Challenge',
    description: 'Complete 50,000 steps this week to earn bonus points',
    category: 'Endurance',
    difficulty: 'medium',
    pointValue: 100,
    duration: 'weekly',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-01-22T00:00:00Z',
    teamId: 'team-1',
    createdBy: 'user-1',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'quest-2',
    title: 'Daily Hydration Goal',
    description: 'Drink 8 glasses of water every day this week',
    category: 'Health',
    difficulty: 'easy',
    pointValue: 50,
    duration: 'daily',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-01-22T00:00:00Z',
    teamId: 'team-1',
    createdBy: 'user-2',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'quest-3',
    title: 'Strength Training Challenge',
    description: 'Complete 3 strength training sessions this week',
    category: 'Strength',
    difficulty: 'hard',
    pointValue: 150,
    duration: 'weekly',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-01-22T00:00:00Z',
    teamId: 'team-1',
    createdBy: 'user-1',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

const mockTeamChallenges: TeamChallenge[] = [
  {
    id: 'challenge-1',
    title: '1-on-1 Step Battle',
    description: 'Challenge your teammate to a step competition',
    type: 'step_competition',
    duration: 7,
    createdBy: 'user-1',
    teamId: 'team-1',
    isActive: true,
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-01-22T00:00:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'challenge-2',
    title: 'Group Workout Challenge',
    description: 'Complete a group workout session together',
    type: 'workout',
    duration: 3,
    createdBy: 'user-2',
    teamId: 'team-1',
    isActive: true,
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-01-18T00:00:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

const mockTeamRecognitions: TeamRecognition[] = [
  {
    id: 'recognition-1',
    fromUserId: 'user-1',
    toUserId: 'user-2',
    teamId: 'team-1',
    type: 'fire',
    message: 'Amazing performance in the step challenge!',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'recognition-2',
    fromUserId: 'user-2',
    toUserId: 'user-1',
    teamId: 'team-1',
    type: 'clap',
    message: 'Great leadership this week!',
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'recognition-3',
    fromUserId: 'user-3',
    toUserId: 'user-1',
    teamId: 'team-1',
    type: 'trophy',
    message: 'Champion of the week!',
    createdAt: '2024-01-15T08:00:00Z',
  },
];

/**
 * Team Challenges Service - Handles all team challenges, quests, and recognition
 */
export class TeamChallengesService {
  /**
   * Get team quests
   */
  static async getTeamQuests(
    teamId: string
  ): Promise<TeamChallengesServiceResponse<TeamQuest[]>> {
    try {
      logger.debug('TeamChallengesService: Fetching team quests', { teamId });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const quests = mockTeamQuests.filter(quest => quest.teamId === teamId);

      logger.info('TeamChallengesService: Successfully fetched team quests', {
        teamId,
        questCount: quests.length,
      });

      return {
        data: quests,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error('TeamChallengesService: Error fetching team quests', {
        teamId,
        error,
      });
      return {
        data: null,
        error: 'Failed to load team quests',
        isLoading: false,
      };
    }
  }

  /**
   * Create a new team quest
   */
  static async createQuest(
    data: CreateQuestData
  ): Promise<TeamChallengesServiceResponse<TeamQuest>> {
    try {
      logger.debug('TeamChallengesService: Creating team quest', { data });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newQuest: TeamQuest = {
        id: `quest-${Date.now()}`,
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        pointValue: data.pointValue,
        duration: data.duration,
        startDate: data.startDate,
        endDate: data.endDate,
        teamId: data.teamId,
        createdBy: 'current-user', // This would come from auth
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to mock data
      mockTeamQuests.push(newQuest);

      logger.info('TeamChallengesService: Successfully created team quest', {
        questId: newQuest.id,
        teamId: data.teamId,
      });

      return {
        data: newQuest,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error('TeamChallengesService: Error creating team quest', {
        data,
        error,
      });
      return {
        data: null,
        error: 'Failed to create team quest',
        isLoading: false,
      };
    }
  }

  /**
   * Get team challenges
   */
  static async getTeamChallenges(
    teamId: string
  ): Promise<TeamChallengesServiceResponse<TeamChallenge[]>> {
    try {
      logger.debug('TeamChallengesService: Fetching team challenges', {
        teamId,
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const challenges = mockTeamChallenges.filter(
        challenge => challenge.teamId === teamId
      );

      logger.info(
        'TeamChallengesService: Successfully fetched team challenges',
        {
          teamId,
          challengeCount: challenges.length,
        }
      );

      return {
        data: challenges,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error('TeamChallengesService: Error fetching team challenges', {
        teamId,
        error,
      });
      return {
        data: null,
        error: 'Failed to load team challenges',
        isLoading: false,
      };
    }
  }

  /**
   * Create a new team challenge
   */
  static async createChallenge(
    data: CreateChallengeData
  ): Promise<TeamChallengesServiceResponse<TeamChallenge>> {
    try {
      logger.debug('TeamChallengesService: Creating team challenge', { data });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newChallenge: TeamChallenge = {
        id: `challenge-${Date.now()}`,
        title: data.title,
        description: data.description,
        type: data.type,
        duration: data.duration,
        teamId: data.teamId,
        createdBy: 'current-user', // This would come from auth
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

      logger.info(
        'TeamChallengesService: Successfully created team challenge',
        {
          challengeId: newChallenge.id,
          teamId: data.teamId,
        }
      );

      return {
        data: newChallenge,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error('TeamChallengesService: Error creating team challenge', {
        data,
        error,
      });
      return {
        data: null,
        error: 'Failed to create team challenge',
        isLoading: false,
      };
    }
  }

  /**
   * Get team recognitions
   */
  static async getTeamRecognitions(
    teamId: string
  ): Promise<TeamChallengesServiceResponse<TeamRecognition[]>> {
    try {
      logger.debug('TeamChallengesService: Fetching team recognitions', {
        teamId,
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const recognitions = mockTeamRecognitions.filter(
        recognition => recognition.teamId === teamId
      );

      logger.info(
        'TeamChallengesService: Successfully fetched team recognitions',
        {
          teamId,
          recognitionCount: recognitions.length,
        }
      );

      return {
        data: recognitions,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error('TeamChallengesService: Error fetching team recognitions', {
        teamId,
        error,
      });
      return {
        data: null,
        error: 'Failed to load team recognitions',
        isLoading: false,
      };
    }
  }

  /**
   * Give recognition to a teammate
   */
  static async giveRecognition(
    data: RecognitionData
  ): Promise<TeamChallengesServiceResponse<TeamRecognition>> {
    try {
      logger.debug('TeamChallengesService: Giving recognition', { data });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

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

      // Create notification for the recipient
      try {
        await NotificationService.createNotification({
          userId: data.toUserId,
          message: `${data.fromUserId} gave you a ${data.type} for ${data.message || 'your performance'}!`,
          type: 'team_recognition',
          link: '/team-challenges',
          actorId: data.fromUserId,
        });
      } catch (notificationError) {
        logger.warn('Failed to create recognition notification', {
          notificationError,
        });
      }

      logger.info('TeamChallengesService: Successfully gave recognition', {
        recognitionId: newRecognition.id,
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
      });

      return {
        data: newRecognition,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error('TeamChallengesService: Error giving recognition', {
        data,
        error,
      });
      return {
        data: null,
        error: 'Failed to give recognition',
        isLoading: false,
      };
    }
  }

  /**
   * Get user recognition limits
   */
  static async getUserRecognitionLimits(
    userId: string,
    date: Date
  ): Promise<TeamChallengesServiceResponse<UserRecognitionLimit>> {
    try {
      logger.debug('TeamChallengesService: Fetching user recognition limits', {
        userId,
        date: date.toISOString(),
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      const dateString = date.toISOString().split('T')[0];
      const limits: UserRecognitionLimit = {
        id: `limit-${userId}-${dateString}`,
        userId,
        date: dateString,
        clapsUsed: 3,
        firesUsed: 2,
        heartsUsed: 1,
        flexesUsed: 0,
        zapsUsed: 1,
        trophiesUsed: 0,
      };

      logger.info(
        'TeamChallengesService: Successfully fetched user recognition limits',
        {
          userId,
          date: dateString,
        }
      );

      return {
        data: limits,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error(
        'TeamChallengesService: Error fetching user recognition limits',
        {
          userId,
          date: date.toISOString(),
          error,
        }
      );
      return {
        data: null,
        error: 'Failed to load recognition limits',
        isLoading: false,
      };
    }
  }

  /**
   * Check if user can give a specific type of recognition
   */
  static async checkRecognitionLimit(
    userId: string,
    type: string
  ): Promise<boolean> {
    try {
      const limits = await this.getUserRecognitionLimits(userId, new Date());

      if (!limits.data) {
        return false;
      }

      const dailyLimits = {
        clap: 10,
        fire: 5,
        heart: 8,
        flex: 3,
        zap: 5,
        trophy: 2,
      };

      const currentUsage = limits.data[
        `${type}sUsed` as keyof UserRecognitionLimit
      ] as number;
      const limit = dailyLimits[type as keyof typeof dailyLimits] || 0;

      return currentUsage < limit;
    } catch (error) {
      logger.error('TeamChallengesService: Error checking recognition limit', {
        userId,
        type,
        error,
      });
      return false;
    }
  }
}
