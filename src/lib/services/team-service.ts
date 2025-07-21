import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import type { Team, LeaderboardEntry } from '@/types';

export interface TeamServiceResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export interface TeamLeaderboardData {
  teamId: string;
  teamName: string;
  entries: LeaderboardEntry[];
}

export interface SchoolLeaderboardData {
  entries: LeaderboardEntry[];
}

/**
 * Team Service - Handles all team-related API calls and data transformation
 */
export class TeamService {
  /**
   * Get user's teams
   */
  static async getUserTeams(
    userId: string
  ): Promise<TeamServiceResponse<Team[]>> {
    try {
      logger.debug('TeamService: Fetching user teams', { userId });

      const response = await apiClient.getUserTeams(userId);

      if (response.error) {
        logger.error('TeamService: Failed to fetch user teams', {
          userId,
          error: response.error,
        });
        return {
          data: null,
          error: response.error,
          isLoading: false,
        };
      }

      const teams = response.data || [];
      logger.info('TeamService: Successfully fetched user teams', {
        userId,
        teamCount: teams.length,
        teams,
        response,
      });

      return {
        data: teams,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error('TeamService: Unexpected error fetching user teams', {
        userId,
        error,
      });
      return {
        data: null,
        error: 'Failed to load teams',
        isLoading: false,
      };
    }
  }

  /**
   * Get team leaderboard data
   */
  static async getTeamLeaderboard(
    teamId: string
  ): Promise<TeamServiceResponse<TeamLeaderboardData>> {
    try {
      logger.debug('TeamService: Fetching team leaderboard', { teamId });

      const response = await apiClient.getTeamLeaderboard(teamId);

      if (response.error) {
        logger.error('TeamService: Failed to fetch team leaderboard', {
          teamId,
          error: response.error,
        });
        return {
          data: null,
          error: response.error,
          isLoading: false,
        };
      }

      // Transform API response to our format
      const entries: LeaderboardEntry[] = (response.data || []).map(
        (entry: any, index: number) => ({
          userId: String(entry.id || ''),
          firstName: String(entry.firstName || ''),
          lastName: String(entry.lastName || ''),
          profileImage: entry.profileImage ? String(entry.profileImage) : null,
          weeklySteps: Number(entry.weeklySteps) || 0,
          engagementScore: Number(entry.performanceScore) || 0,
          questsCompleted: Number(entry.questsCompleted) || 0,
          journalsCount: Number(entry.journalsCount) || 0,
          rank: index + 1,
          trend: entry.trend || 'none',
          claps: Number(entry.claps) || 0,
          isCurrentUser: Boolean(entry.isCurrentUser),
        })
      );

      const teamData: TeamLeaderboardData = {
        teamId,
        teamName: 'Team Leaderboard', // TODO: Get actual team name
        entries,
      };

      logger.info('TeamService: Successfully fetched team leaderboard', {
        teamId,
        entryCount: entries.length,
      });

      return {
        data: teamData,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error('TeamService: Unexpected error fetching team leaderboard', {
        teamId,
        error,
      });
      return {
        data: null,
        error: 'Failed to load team leaderboard',
        isLoading: false,
      };
    }
  }

  /**
   * Get school leaderboard data
   */
  static async getSchoolLeaderboard(
    userId: string
  ): Promise<TeamServiceResponse<SchoolLeaderboardData>> {
    try {
      logger.debug('TeamService: Fetching school leaderboard', { userId });

      const response = await apiClient.getSchoolLeaderboard(userId);

      if (response.error) {
        logger.error('TeamService: Failed to fetch school leaderboard', {
          userId,
          error: response.error,
        });
        return {
          data: null,
          error: response.error,
          isLoading: false,
        };
      }

      // Transform API response to our format
      const entries: LeaderboardEntry[] = (response.data || []).map(
        (entry: any, index: number) => ({
          userId: String(entry.id || ''),
          firstName: String(entry.firstName || ''),
          lastName: String(entry.lastName || ''),
          profileImage: entry.profileImage ? String(entry.profileImage) : null,
          weeklySteps: Number(entry.weeklySteps) || 0,
          engagementScore: Number(entry.performanceScore) || 0,
          questsCompleted: Number(entry.questsCompleted) || 0,
          journalsCount: Number(entry.journalsCount) || 0,
          rank: index + 1,
          trend: entry.trend || 'none',
          claps: Number(entry.claps) || 0,
          isCurrentUser: Boolean(entry.isCurrentUser),
        })
      );

      const schoolData: SchoolLeaderboardData = {
        entries,
      };

      logger.info('TeamService: Successfully fetched school leaderboard', {
        userId,
        entryCount: entries.length,
      });

      return {
        data: schoolData,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      logger.error(
        'TeamService: Unexpected error fetching school leaderboard',
        {
          userId,
          error,
        }
      );
      return {
        data: null,
        error: 'Failed to load school leaderboard',
        isLoading: false,
      };
    }
  }

  /**
   * Get combined leaderboard data (team + school)
   */
  static async getCombinedLeaderboard(
    userId: string,
    teamId?: string
  ): Promise<{
    team: TeamServiceResponse<TeamLeaderboardData>;
    school: TeamServiceResponse<SchoolLeaderboardData>;
  }> {
    const promises = [
      teamId
        ? this.getTeamLeaderboard(teamId)
        : Promise.resolve({
            data: null,
            error: null,
            isLoading: false,
          } as TeamServiceResponse<TeamLeaderboardData>),
      this.getSchoolLeaderboard(userId),
    ];

    const [teamResult, schoolResult] = await Promise.all(promises);

    return {
      team: teamResult,
      school: schoolResult,
    };
  }
}
