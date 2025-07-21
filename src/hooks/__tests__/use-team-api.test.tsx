import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/services/team-service', () => ({
  TeamService: {
    getUserTeams: vi.fn(),
    getTeamLeaderboard: vi.fn(),
    getSchoolLeaderboard: vi.fn(),
    getCombinedLeaderboard: vi.fn(),
  },
}));
vi.mock('@/lib/error-handler', () => ({
  ErrorHandler: {
    handleApiError: vi.fn(),
    logError: vi.fn(),
  },
}));
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

import {
  useUserTeams,
  useTeamLeaderboard,
  useSchoolLeaderboard,
  useCombinedLeaderboard,
  useInvalidateTeamQueries,
} from '../use-team-api';
import { TeamService } from '@/lib/services/team-service';
import { ErrorHandler } from '@/lib/error-handler';
import { Team, LeaderboardEntry } from '@/types';

describe('useTeamApi', () => {
  const userId = 'user-123';
  const teamId = 'team-123';
  const mockTeamService = vi.mocked(TeamService);
  const mockErrorHandler = vi.mocked(ErrorHandler);

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useUserTeams', () => {
    it('should fetch user teams successfully', async () => {
      const mockTeams: Team[] = [
        {
          id: 'team-1',
          name: 'Varsity Football',
          sportID: 'sport-1',
          schoolID: 'school-1',
        },
        {
          id: 'team-2',
          name: 'JV Basketball',
          sportID: 'sport-2',
          schoolID: 'school-1',
        },
      ];

      mockTeamService.getUserTeams.mockResolvedValue({
        data: mockTeams,
        error: null,
        isLoading: false,
      });

      const { result } = renderHook(() => useUserTeams(userId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.data).toEqual(mockTeams);
      expect(mockTeamService.getUserTeams).toHaveBeenCalledWith(userId);
    });

    it('should handle API errors gracefully', async () => {
      const error = {
        code: 'TEAM_FETCH_ERROR',
        message: 'Failed to fetch teams',
      };
      mockTeamService.getUserTeams.mockRejectedValue(error);
      mockErrorHandler.handleApiError.mockReturnValue(error);

      const { result } = renderHook(() => useUserTeams(userId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
      expect(mockErrorHandler.handleApiError).toHaveBeenCalled();
    });

    it('should not fetch when userId is null', () => {
      const { result } = renderHook(() => useUserTeams(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockTeamService.getUserTeams).not.toHaveBeenCalled();
    });
  });

  describe('useTeamLeaderboard', () => {
    it('should fetch team leaderboard successfully', async () => {
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          userId: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          profileImage: 'profile.jpg',
          engagementScore: 85,
          weeklySteps: 50000,
          questsCompleted: 5,
          journalsCount: 3,
          rank: 1,
          trend: 'up',
          claps: 10,
          isCurrentUser: false,
        },
        {
          userId: 'user-2',
          firstName: 'Jane',
          lastName: 'Smith',
          profileImage: 'profile2.jpg',
          engagementScore: 80,
          weeklySteps: 45000,
          questsCompleted: 4,
          journalsCount: 2,
          rank: 2,
          trend: 'down',
          claps: 8,
          isCurrentUser: false,
        },
      ];

      mockTeamService.getTeamLeaderboard.mockResolvedValue({
        data: {
          teamId: 'team-1',
          teamName: 'Varsity Football',
          entries: mockLeaderboard,
        },
        error: null,
        isLoading: false,
      });

      const { result } = renderHook(() => useTeamLeaderboard(teamId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.data?.entries).toEqual(mockLeaderboard);
      expect(mockTeamService.getTeamLeaderboard).toHaveBeenCalledWith(teamId);
    });

    it('should not fetch when teamId is null', () => {
      const { result } = renderHook(() => useTeamLeaderboard(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockTeamService.getTeamLeaderboard).not.toHaveBeenCalled();
    });
  });

  describe('useSchoolLeaderboard', () => {
    it('should fetch school leaderboard successfully', async () => {
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          userId: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          profileImage: 'profile.jpg',
          engagementScore: 85,
          weeklySteps: 50000,
          questsCompleted: 5,
          journalsCount: 3,
          rank: 1,
          trend: 'up',
          claps: 10,
          isCurrentUser: false,
        },
        {
          userId: 'user-2',
          firstName: 'Jane',
          lastName: 'Smith',
          profileImage: 'profile2.jpg',
          engagementScore: 80,
          weeklySteps: 45000,
          questsCompleted: 4,
          journalsCount: 2,
          rank: 2,
          trend: 'down',
          claps: 8,
          isCurrentUser: false,
        },
      ];

      mockTeamService.getSchoolLeaderboard.mockResolvedValue({
        data: { entries: mockLeaderboard },
        error: null,
        isLoading: false,
      });

      const { result } = renderHook(() => useSchoolLeaderboard(userId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.data?.entries).toEqual(mockLeaderboard);
      expect(mockTeamService.getSchoolLeaderboard).toHaveBeenCalledWith(userId);
    });

    it('should not fetch when userId is null', () => {
      const { result } = renderHook(() => useSchoolLeaderboard(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockTeamService.getSchoolLeaderboard).not.toHaveBeenCalled();
    });
  });

  describe('useCombinedLeaderboard', () => {
    it('should fetch combined leaderboard successfully', async () => {
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          userId: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          profileImage: 'profile.jpg',
          engagementScore: 85,
          weeklySteps: 50000,
          questsCompleted: 5,
          journalsCount: 3,
          rank: 1,
          trend: 'up',
          claps: 10,
          isCurrentUser: false,
        },
        {
          userId: 'user-2',
          firstName: 'Jane',
          lastName: 'Smith',
          profileImage: 'profile2.jpg',
          engagementScore: 80,
          weeklySteps: 45000,
          questsCompleted: 4,
          journalsCount: 2,
          rank: 2,
          trend: 'down',
          claps: 8,
          isCurrentUser: false,
        },
      ];

      mockTeamService.getCombinedLeaderboard.mockResolvedValue({
        team: {
          data: { teamId: 'team-1', teamName: 'Varsity Football', entries: mockLeaderboard },
          error: null,
          isLoading: false,
        },
        school: {
          data: { entries: mockLeaderboard },
          error: null,
          isLoading: false,
        },
      });

      const { result } = renderHook(
        () => useCombinedLeaderboard(userId, teamId),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.team.data?.entries).toEqual(mockLeaderboard);
      expect(result.current.data?.school.data?.entries).toEqual(mockLeaderboard);
      expect(mockTeamService.getCombinedLeaderboard).toHaveBeenCalledWith(userId, teamId);
    });

    it('should work without teamId', async () => {
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          userId: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          profileImage: 'profile.jpg',
          engagementScore: 85,
          weeklySteps: 50000,
          questsCompleted: 5,
          journalsCount: 3,
          rank: 1,
          trend: 'up',
          claps: 10,
          isCurrentUser: false,
        },
      ];

      mockTeamService.getCombinedLeaderboard.mockResolvedValue({
        team: {
          data: null,
          error: null,
          isLoading: false,
        },
        school: {
          data: { entries: mockLeaderboard },
          error: null,
          isLoading: false,
        },
      });

      const { result } = renderHook(() => useCombinedLeaderboard(userId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.school.data?.entries).toEqual(mockLeaderboard);
      expect(mockTeamService.getCombinedLeaderboard).toHaveBeenCalledWith(userId, undefined);
    });
  });

  describe('useInvalidateTeamQueries', () => {
    it('should return invalidate functions', () => {
      const { result } = renderHook(() => useInvalidateTeamQueries(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.invalidateUserTeams).toBe('function');
      expect(typeof result.current.invalidateTeamLeaderboard).toBe('function');
      expect(typeof result.current.invalidateSchoolLeaderboard).toBe('function');
      expect(typeof result.current.invalidateCombinedLeaderboard).toBe('function');
      expect(typeof result.current.invalidateAllTeamQueries).toBe('function');
    });
  });
});
