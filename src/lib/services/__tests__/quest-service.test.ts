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
    getUserQuests: vi.fn(),
    completeQuest: vi.fn(),
    getCompletedQuests: vi.fn(),
    assignQuests: vi.fn(),
    getQuestCategories: vi.fn(),
    getUserStats: vi.fn(),
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
import {
  getCurrentQuests,
  getCompletedQuests,
  getUserStats,
  completeQuest,
  assignNewQuests,
} from '../quest-service';
import { apiClient } from '@/lib/api-client';

describe('QuestService', () => {
  const userId = 'user-123';
  const mockApiClient = vi.mocked(apiClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCurrentQuests', () => {
    it('fetches user quests successfully', async () => {
      const mockQuests = [
        {
          id: 'quest-1',
          title: 'Complete 10,000 steps',
          description: 'Walk 10,000 steps today',
          pointValue: 100,
          categoryName: 'Fitness',
          completedAt: null,
          notes: null,
        },
        {
          id: 'quest-2',
          title: 'Study for 2 hours',
          description: 'Study for at least 2 hours',
          pointValue: 150,
          categoryName: 'Academic',
          completedAt: null,
          notes: null,
        },
      ];

      const mockResponse = {
        data: mockQuests,
        error: undefined,
        status: 200,
      };

      mockApiClient.getUserQuests.mockResolvedValue(mockResponse);

      const result = await getCurrentQuests(userId);

      expect(mockApiClient.getUserQuests).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockQuests);
    });

    it('handles API errors gracefully', async () => {
      const mockError = {
        data: undefined,
        error: 'Failed to fetch quests',
        status: 500,
      };

      mockApiClient.getUserQuests.mockResolvedValue(mockError);

      const result = await getCurrentQuests(userId);

      expect(result).toEqual([]);
    });
  });

  describe('completeQuest', () => {
    it('completes quest successfully', async () => {
      const questId = 'quest-1';
      const notes = 'Completed successfully';

      const mockResponse = {
        data: {
          success: true,
          points: 100,
          newLevel: 2,
          totalPoints: 500,
        },
        error: undefined,
        status: 200,
      };

      mockApiClient.completeQuest.mockResolvedValue(mockResponse);

      const result = await completeQuest(userId, questId, notes);

      expect(mockApiClient.completeQuest).toHaveBeenCalledWith(
        userId,
        questId,
        notes
      );
      expect(result).toEqual({
        success: true,
        points: 100,
        newLevel: 2,
        totalPoints: 500,
      });
    });

    it('handles completion errors gracefully', async () => {
      const questId = 'quest-1';
      const notes = 'Completed successfully';

      const mockError = {
        data: undefined,
        error: 'Failed to complete quest',
        status: 500,
      };

      mockApiClient.completeQuest.mockResolvedValue(mockError);

      const result = await completeQuest(userId, questId, notes);

      expect(result).toEqual({ success: false });
    });
  });

  describe('getCompletedQuests', () => {
    it('fetches completed quests successfully', async () => {
      const mockCompletedQuests = [
        {
          id: 'quest-1',
          title: 'Complete 10,000 steps',
          description: 'Walk 10,000 steps today',
          pointValue: 100,
          categoryName: 'Fitness',
          completedAt: '2024-01-01T12:00:00Z',
          notes: 'Completed successfully',
        },
      ];

      const mockResponse = {
        data: mockCompletedQuests,
        error: undefined,
        status: 200,
      };

      mockApiClient.getCompletedQuests.mockResolvedValue(mockResponse);

      const result = await getCompletedQuests(userId);

      expect(mockApiClient.getCompletedQuests).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockCompletedQuests);
    });
  });

  describe('assignNewQuests', () => {
    it('assigns quests successfully', async () => {
      const mockQuests = [
        {
          id: 'quest-1',
          title: 'New Quest',
          description: 'A new quest',
          pointValue: 100,
          categoryName: 'Fitness',
          completedAt: null,
          notes: null,
        },
      ];

      const mockResponse = {
        data: mockQuests,
        error: undefined,
        status: 200,
      };

      mockApiClient.assignQuests.mockResolvedValue(mockResponse);

      const result = await assignNewQuests(userId);

      expect(mockApiClient.assignQuests).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockQuests);
    });
  });

  describe('getUserStats', () => {
    it('fetches user stats successfully', async () => {
      const mockStats = [
        {
          id: 'stat-1',
          categoryId: 'cat-1',
          categoryName: 'Fitness',
          points: 500,
          level: 2,
        },
        {
          id: 'stat-2',
          categoryId: 'cat-2',
          categoryName: 'Academic',
          points: 300,
          level: 1,
        },
      ];

      const mockResponse = {
        data: mockStats,
        error: undefined,
        status: 200,
      };

      mockApiClient.getUserStats.mockResolvedValue(mockResponse);

      const result = await getUserStats(userId);

      expect(mockApiClient.getUserStats).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockStats);
    });
  });
});
