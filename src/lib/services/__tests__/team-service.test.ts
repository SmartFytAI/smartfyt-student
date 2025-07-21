import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock React Query to prevent hooks from executing
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

// Mock the apiClient BEFORE importing the service
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    getUserTeams: vi.fn(),
    getTeamLeaderboard: vi.fn(),
    getSchoolLeaderboard: vi.fn(),
  },
}));

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Import after mocks are set up
import { TeamService } from '../team-service';
import { apiClient } from '@/lib/api-client';

describe('TeamService', () => {
  const userId = 'user-123';
  const teamId = 'team-123';
  const mockApiClient = vi.mocked(apiClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getUserTeams', () => {
    it('fetches user teams successfully', async () => {
      const mockTeams = [
        {
          id: 'team-1',
          name: 'Varsity Football',
          sportID: 'sport-1',
          schoolID: 'school-1',
          sport: { id: 'sport-1', name: 'Football' },
          school: { id: 'school-1', name: 'High School' },
        },
        {
          id: 'team-2',
          name: 'JV Basketball',
          sportID: 'sport-2',
          schoolID: 'school-1',
          sport: { id: 'sport-2', name: 'Basketball' },
          school: { id: 'school-1', name: 'High School' },
        },
      ];

      const mockResponse = {
        data: mockTeams,
        error: undefined,
        status: 200,
      };

      mockApiClient.getUserTeams.mockResolvedValue(mockResponse);

      const result = await TeamService.getUserTeams(userId);

      expect(mockApiClient.getUserTeams).toHaveBeenCalledWith(userId);
      expect(result.data).toEqual(mockTeams);
      expect(result.error).toBe(null);
      expect(result.isLoading).toBe(false);
    });

    it('handles API errors gracefully', async () => {
      const mockError = {
        data: undefined,
        error: 'Failed to fetch teams',
        status: 500,
      };

      mockApiClient.getUserTeams.mockResolvedValue(mockError);

      const result = await TeamService.getUserTeams(userId);

      expect(result.data).toBe(null);
      expect(result.error).toBe('Failed to fetch teams');
      expect(result.isLoading).toBe(false);
    });

    it('handles network errors', async () => {
      const networkError = new Error('Network error');
      mockApiClient.getUserTeams.mockRejectedValue(networkError);

      const result = await TeamService.getUserTeams(userId);

      expect(result.data).toBe(null);
      expect(result.error).toBe('Failed to load teams');
      expect(result.isLoading).toBe(false);
    });
  });

  describe('getTeamLeaderboard', () => {
    it('fetches team leaderboard successfully', async () => {
      const mockLeaderboard = [
        {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          profileImage: 'profile.jpg',
          performanceScore: 1250,
          trend: 'up' as const,
        },
        {
          id: 'user-2',
          firstName: 'Jane',
          lastName: 'Smith',
          profileImage: 'profile2.jpg',
          performanceScore: 1100,
          trend: 'down' as const,
        },
      ];

      const mockResponse = {
        data: mockLeaderboard,
        error: undefined,
        status: 200,
      };

      mockApiClient.getTeamLeaderboard.mockResolvedValue(mockResponse);

      const result = await TeamService.getTeamLeaderboard(teamId);

      expect(mockApiClient.getTeamLeaderboard).toHaveBeenCalledWith(teamId);
      expect(result.data?.entries).toBeDefined();
      expect(result.error).toBe(null);
      expect(result.isLoading).toBe(false);
    });

    it('handles API errors gracefully', async () => {
      const mockError = {
        data: undefined,
        error: 'Failed to fetch leaderboard',
        status: 500,
      };

      mockApiClient.getTeamLeaderboard.mockResolvedValue(mockError);

      const result = await TeamService.getTeamLeaderboard(teamId);

      expect(result.data).toBe(null);
      expect(result.error).toBe('Failed to fetch leaderboard');
      expect(result.isLoading).toBe(false);
    });
  });

  describe('getSchoolLeaderboard', () => {
    it('fetches school leaderboard successfully', async () => {
      const mockLeaderboard = [
        {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          profileImage: 'profile.jpg',
          performanceScore: 1250,
          trend: 'up' as const,
        },
      ];

      const mockResponse = {
        data: mockLeaderboard,
        error: undefined,
        status: 200,
      };

      mockApiClient.getSchoolLeaderboard.mockResolvedValue(mockResponse);

      const result = await TeamService.getSchoolLeaderboard(userId);

      expect(mockApiClient.getSchoolLeaderboard).toHaveBeenCalledWith(userId);
      expect(result.data?.entries).toBeDefined();
      expect(result.error).toBe(null);
      expect(result.isLoading).toBe(false);
    });

    it('handles API errors gracefully', async () => {
      const mockError = {
        data: undefined,
        error: 'Failed to fetch school leaderboard',
        status: 500,
      };

      mockApiClient.getSchoolLeaderboard.mockResolvedValue(mockError);

      const result = await TeamService.getSchoolLeaderboard(userId);

      expect(result.data).toBe(null);
      expect(result.error).toBe('Failed to fetch school leaderboard');
      expect(result.isLoading).toBe(false);
    });
  });

  describe('getCombinedLeaderboard', () => {
    it('fetches combined leaderboard successfully', async () => {
      const mockLeaderboard = [
        {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          profileImage: 'profile.jpg',
          performanceScore: 1250,
          trend: 'up' as const,
        },
      ];

      const mockTeamResponse = {
        data: mockLeaderboard,
        error: undefined,
        status: 200,
      };

      const mockSchoolResponse = {
        data: mockLeaderboard,
        error: undefined,
        status: 200,
      };

      mockApiClient.getTeamLeaderboard.mockResolvedValue(mockTeamResponse);
      mockApiClient.getSchoolLeaderboard.mockResolvedValue(mockSchoolResponse);

      const result = await TeamService.getCombinedLeaderboard(userId, teamId);

      expect(mockApiClient.getTeamLeaderboard).toHaveBeenCalledWith(teamId);
      expect(mockApiClient.getSchoolLeaderboard).toHaveBeenCalledWith(userId);
      expect(result.team.data?.entries).toBeDefined();
      expect(result.school.data?.entries).toBeDefined();
    });

    it('works without teamId', async () => {
      const mockLeaderboard = [
        {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          profileImage: 'profile.jpg',
          performanceScore: 1250,
          trend: 'up' as const,
        },
      ];

      const mockSchoolResponse = {
        data: mockLeaderboard,
        error: undefined,
        status: 200,
      };

      mockApiClient.getSchoolLeaderboard.mockResolvedValue(mockSchoolResponse);

      const result = await TeamService.getCombinedLeaderboard(userId);

      expect(mockApiClient.getSchoolLeaderboard).toHaveBeenCalledWith(userId);
      expect(result.school.data?.entries).toBeDefined();
      expect(result.team.data).toBe(null);
    });
  });
});
