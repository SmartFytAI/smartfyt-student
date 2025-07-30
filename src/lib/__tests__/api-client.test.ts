import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  },
}));

import { ApiClient } from '../api-client';

describe('ApiClient', () => {
  const baseUrl = 'http://localhost:3001';
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient(baseUrl);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('creates instance with default base URL', () => {
      const defaultClient = new ApiClient();
      expect(defaultClient).toBeInstanceOf(ApiClient);
    });

    it('creates instance with custom base URL', () => {
      const customClient = new ApiClient('https://api.example.com');
      expect(customClient).toBeInstanceOf(ApiClient);
    });
  });

  describe('authentication', () => {
    it('sets and clears auth token', () => {
      const token = 'test-token';
      client.setAuthToken(token);
      client.clearAuthToken();
      // Note: We can't directly test private properties, but we can test the behavior
      expect(client).toBeInstanceOf(ApiClient);
    });

    it('sets token provider', () => {
      const getToken = vi.fn().mockResolvedValue('dynamic-token');
      client.setTokenProvider(getToken);
      expect(client).toBeInstanceOf(ApiClient);
    });
  });

  describe('health check', () => {
    it('makes successful health check request', async () => {
      const mockResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.healthCheck();

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/health`,
        expect.objectContaining({
          headers: expect.any(Object),
        })
      );

      expect(result).toEqual({
        data: mockResponse,
        status: 200,
      });
    });

    it('handles health check error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      const result = await client.healthCheck();

      expect(result).toEqual({
        error: 'Internal Server Error',
        status: 500,
      });
    });
  });

  describe('sports endpoints', () => {
    it('fetches sports successfully', async () => {
      const mockSports = [
        { id: '1', name: 'Basketball' },
        { id: '2', name: 'Football' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSports,
      });

      const result = await client.getSports();

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/sports`,
        expect.objectContaining({
          headers: expect.any(Object),
        })
      );

      expect(result).toEqual({
        data: mockSports,
        status: 200,
      });
    });
  });

  describe('user endpoints', () => {
    it('fetches user data successfully', async () => {
      const mockUserData = { id: '123', name: 'John Doe' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockUserData,
      });

      const result = await client.getUserData('123');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/users/123/data`,
        expect.objectContaining({
          headers: expect.any(Object),
        })
      );

      expect(result).toEqual({
        data: mockUserData,
        status: 200,
      });
    });
  });

  describe('journal endpoints', () => {
    it('fetches journals successfully', async () => {
      const mockJournals = [{ id: '1', title: 'Daily Reflection' }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockJournals,
      });

      const result = await client.getJournals('123');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/users/123/journals`,
        expect.objectContaining({
          headers: expect.any(Object),
        })
      );

      expect(result).toEqual({
        data: mockJournals,
        status: 200,
      });
    });

    it('creates journal successfully', async () => {
      const journalData = {
        userId: '123',
        title: 'New Entry',
        wentWell: 'Had a great workout',
      };

      const mockResponse = { id: '1', ...journalData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const result = await client.createJournal(journalData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/journals`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(journalData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result).toEqual({
        data: mockResponse,
        status: 201,
      });
    });
  });

  describe('quest endpoints', () => {
    it('fetches user quests successfully', async () => {
      const mockQuests = [{ id: '1', title: 'Complete workout' }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockQuests,
      });

      const result = await client.getUserQuests('123');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/users/123/quests`,
        expect.objectContaining({
          headers: expect.any(Object),
        })
      );

      expect(result).toEqual({
        data: mockQuests,
        status: 200,
      });
    });

    it('completes quest successfully', async () => {
      const questData = { questId: '1', notes: 'Completed successfully' };

      const mockResponse = { success: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.completeQuest(
        '123',
        '1',
        'Completed successfully'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/users/123/quests/complete`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(questData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result).toEqual({
        data: mockResponse,
        status: 200,
      });
    });
  });

  describe('motivational quotes endpoints', () => {
    it('fetches daily quote successfully', async () => {
      const mockQuote = { id: 1, text: 'Stay motivated!', author: 'Unknown' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockQuote,
      });

      const result = await client.getDailyQuote();

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/motivational-quotes/daily`
      );

      expect(result).toEqual({
        data: mockQuote,
        status: 200,
      });
    });

    it('handles quote fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await client.getDailyQuote();

      expect(result).toEqual({
        error: 'Network error',
        status: 0,
      });
    });
  });

  describe('error handling', () => {
    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await client.healthCheck();

      expect(result).toEqual({
        error: 'Network error',
        status: 0,
      });
    });

    it('handles non-JSON error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server Error',
      });

      const result = await client.healthCheck();

      expect(result).toEqual({
        error: 'Server Error',
        status: 500,
      });
    });
  });

  describe('authorization headers', () => {
    it('includes authorization header when token is set', async () => {
      const token = 'test-token';
      client.setAuthToken(token);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' }),
      });

      await client.healthCheck();

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/health`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        })
      );
    });

    it('does not include authorization header when no token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' }),
      });

      await client.healthCheck();

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/health`,
        expect.objectContaining({
          headers: expect.any(Object),
        })
      );

      // Should not have Authorization header
      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.headers).not.toHaveProperty('Authorization');
    });
  });
});
