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
    getJournals: vi.fn(),
    getJournalDates: vi.fn(),
    createJournal: vi.fn(),
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
import { JournalService } from '../journal-service';
import { apiClient } from '@/lib/api-client';

describe('JournalService', () => {
  const userId = 'user-123';
  const mockApiClient = vi.mocked(apiClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore any mocked globals
    vi.restoreAllMocks();
  });

  describe('getJournals', () => {
    it('fetches journals successfully', async () => {
      const mockResponse = {
        data: {
          journals: [
            {
              id: 'journal-1',
              title: 'Test Journal',
              content: 'Test content',
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
          pagination: {
            total: 1,
            limit: 10,
            offset: 0,
            hasMore: false,
          },
        },
        error: undefined,
        status: 200,
      };

      mockApiClient.getJournals.mockResolvedValue(mockResponse);

      const result = await JournalService.getJournals(userId);

      expect(mockApiClient.getJournals).toHaveBeenCalledWith(userId, '');
      expect(result).toEqual(mockResponse.data);
    });

    it('handles API errors gracefully', async () => {
      const mockError = {
        data: undefined,
        error: 'Failed to fetch journals',
        status: 500,
      };

      mockApiClient.getJournals.mockResolvedValue(mockError);

      await expect(JournalService.getJournals(userId)).rejects.toThrow(
        'Failed to fetch journals'
      );
    });

    it('handles network errors', async () => {
      const networkError = new Error('Network error');
      mockApiClient.getJournals.mockRejectedValue(networkError);

      await expect(JournalService.getJournals(userId)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getJournalDates', () => {
    it('fetches journal dates successfully', async () => {
      const mockResponse = {
        data: ['2024-01-01T00:00:00Z', '2024-01-02T00:00:00Z'],
        error: undefined,
        status: 200,
      };

      mockApiClient.getJournalDates.mockResolvedValue(mockResponse);

      const result = await JournalService.getJournalDates(userId);

      expect(mockApiClient.getJournalDates).toHaveBeenCalledWith(userId);
      expect(result).toEqual(['2024-01-01', '2024-01-02']);
    });

    it('handles API errors gracefully', async () => {
      const mockError = {
        data: undefined,
        error: 'Failed to fetch journal dates',
        status: 500,
      };

      mockApiClient.getJournalDates.mockResolvedValue(mockError);

      await expect(JournalService.getJournalDates(userId)).rejects.toThrow(
        'Failed to fetch journal dates'
      );
    });
  });

  describe('createJournal', () => {
    it('creates journal successfully', async () => {
      const journalData = {
        userId,
        title: 'New Journal',
        wentWell: 'Everything went well',
        notWell: 'Nothing went wrong',
        goals: 'My goals',
        sleepHours: 8,
        activeHours: 2,
        stress: 5,
        screenTime: 3,
        studyHours: 4,
      };

      const mockResponse = {
        data: {
          id: 'journal-1',
          ...journalData,
          authorID: userId,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          response: '',
        },
        error: undefined,
        status: 201,
      };

      mockApiClient.createJournal.mockResolvedValue(mockResponse);

      const result = await JournalService.createJournal(journalData);

      expect(mockApiClient.createJournal).toHaveBeenCalledWith(journalData);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles API errors gracefully', async () => {
      const journalData = {
        userId,
        title: 'New Journal',
      };

      const mockError = {
        data: undefined,
        error: 'Failed to create journal',
        status: 500,
      };

      mockApiClient.createJournal.mockResolvedValue(mockError);

      await expect(JournalService.createJournal(journalData)).rejects.toThrow(
        'Failed to create journal'
      );
    });
  });

  describe('hasJournalToday', () => {
    it('returns true when user has journal today', async () => {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      // Mock getJournalDates to return today's date
      mockApiClient.getJournalDates.mockResolvedValue({
        data: [todayString],
        error: undefined,
        status: 200,
      });

      const result = await JournalService.hasJournalToday(userId);

      expect(result).toBe(true);
      expect(mockApiClient.getJournalDates).toHaveBeenCalledWith(userId);
    });

    it('returns false when user has no journal today', async () => {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      // Mock getJournalDates to return different dates
      mockApiClient.getJournalDates.mockResolvedValue({
        data: ['2024-01-01', '2024-01-02'],
        error: undefined,
        status: 200,
      });

      const result = await JournalService.hasJournalToday(userId);

      expect(result).toBe(false);
      expect(mockApiClient.getJournalDates).toHaveBeenCalledWith(userId);
    });
  });

  describe('getLatestJournal', () => {
    it('returns latest journal when available', async () => {
      const mockJournals = {
        data: {
          journals: [
            {
              id: 'journal-2',
              title: 'Latest Journal',
              wentWell: 'Everything went well',
              notWell: 'Nothing went wrong',
              goals: 'My goals',
              authorID: userId,
              createdAt: '2024-01-02T00:00:00Z',
              updatedAt: '2024-01-02T00:00:00Z',
              response: '',
              sleepHours: 8,
              activeHours: 2,
              stress: 5,
              screenTime: 3,
              studyHours: 4,
            },
            {
              id: 'journal-1',
              title: 'Older Journal',
              wentWell: 'Everything went well',
              notWell: 'Nothing went wrong',
              goals: 'My goals',
              authorID: userId,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
              response: '',
              sleepHours: 8,
              activeHours: 2,
              stress: 5,
              screenTime: 3,
              studyHours: 4,
            },
          ],
          pagination: {
            total: 2,
            limit: 10,
            offset: 0,
            hasMore: false,
          },
        },
        error: undefined,
        status: 200,
      };

      mockApiClient.getJournals.mockResolvedValue(mockJournals);

      const result = await JournalService.getLatestJournal(userId);

      expect(result).toEqual(mockJournals.data.journals[0]);
      expect(mockApiClient.getJournals).toHaveBeenCalledWith(userId, 'limit=1');
    });

    it('returns null when no journals available', async () => {
      const mockJournals = {
        data: {
          journals: [],
          pagination: {
            total: 0,
            limit: 10,
            offset: 0,
            hasMore: false,
          },
        },
        error: undefined,
        status: 200,
      };

      mockApiClient.getJournals.mockResolvedValue(mockJournals);

      const result = await JournalService.getLatestJournal(userId);

      expect(result).toBe(null);
    });
  });

  describe('hasJournalForDate', () => {
    it('returns true when journal exists for date', async () => {
      const date = new Date('2024-01-01');
      const dateString = date.toISOString().split('T')[0];

      mockApiClient.getJournalDates.mockResolvedValue({
        data: [dateString, '2024-01-02'],
        error: undefined,
        status: 200,
      });

      const result = await JournalService.hasJournalForDate(userId, date);

      expect(result).toBe(true);
      expect(mockApiClient.getJournalDates).toHaveBeenCalledWith(userId);
    });

    it('returns false when no journal exists for date', async () => {
      const date = new Date('2024-01-01');
      const dateString = date.toISOString().split('T')[0];

      mockApiClient.getJournalDates.mockResolvedValue({
        data: ['2024-01-02', '2024-01-03'],
        error: undefined,
        status: 200,
      });

      const result = await JournalService.hasJournalForDate(userId, date);

      expect(result).toBe(false);
    });
  });

  describe('getJournalForDate', () => {
    it('returns journal for specific date', async () => {
      const date = new Date('2024-01-01');
      const dateString = date.toISOString().split('T')[0];

      // Mock getJournalDates (called by hasJournalForDate)
      mockApiClient.getJournalDates.mockResolvedValue({
        data: [dateString, '2024-01-02'],
        error: undefined,
        status: 200,
      });

      const mockJournals = {
        data: {
          journals: [
            {
              id: 'journal-1',
              title: 'Journal for 2024-01-01',
              wentWell: 'Everything went well',
              notWell: 'Nothing went wrong',
              goals: 'My goals',
              authorID: userId,
              createdAt: dateString + 'T00:00:00Z',
              updatedAt: dateString + 'T00:00:00Z',
              response: '',
              sleepHours: 8,
              activeHours: 2,
              stress: 5,
              screenTime: 3,
              studyHours: 4,
            },
          ],
          pagination: {
            total: 1,
            limit: 10,
            offset: 0,
            hasMore: false,
          },
        },
        error: undefined,
        status: 200,
      };

      mockApiClient.getJournals.mockResolvedValue(mockJournals);

      const result = await JournalService.getJournalForDate(userId, date);

      expect(result).toEqual(mockJournals.data.journals[0]);
    });

    it('returns null when no journal exists for date', async () => {
      const date = new Date('2024-01-01');
      const dateString = date.toISOString().split('T')[0];

      // Mock getJournalDates (called by hasJournalForDate)
      mockApiClient.getJournalDates.mockResolvedValue({
        data: ['2024-01-02', '2024-01-03'], // Different dates
        error: undefined,
        status: 200,
      });

      const mockJournals = {
        data: {
          journals: [],
          pagination: {
            total: 0,
            limit: 10,
            offset: 0,
            hasMore: false,
          },
        },
        error: undefined,
        status: 200,
      };

      mockApiClient.getJournals.mockResolvedValue(mockJournals);

      const result = await JournalService.getJournalForDate(userId, date);

      expect(result).toBe(null);
    });
  });
});
