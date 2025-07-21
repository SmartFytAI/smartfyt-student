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
    getDailyQuote: vi.fn(),
    getRandomQuote: vi.fn(),
    getAllQuotes: vi.fn(),
    getQuotesByCategory: vi.fn(),
    getQuoteCategories: vi.fn(),
    getQuoteById: vi.fn(),
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
import { MotivationalQuotesService } from '../motivational-quotes-service';
import { apiClient } from '@/lib/api-client';

describe('MotivationalQuotesService', () => {
  const mockApiClient = vi.mocked(apiClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDailyQuote', () => {
    it('fetches daily quote successfully', async () => {
      const mockQuote = {
        id: 1,
        quote: 'Success is not final, failure is not fatal.',
        author: 'Winston Churchill',
        category: 'motivation',
      };

      const mockResponse = {
        data: {
          success: true,
          data: mockQuote,
        },
        error: undefined,
        status: 200,
      };

      mockApiClient.getDailyQuote.mockResolvedValue(mockResponse);

      const result = await MotivationalQuotesService.getDailyQuote();

      expect(mockApiClient.getDailyQuote).toHaveBeenCalled();
      expect(result).toEqual(mockQuote);
    });

    it('handles API errors gracefully', async () => {
      const mockError = {
        data: {
          success: false,
          error: 'Failed to fetch daily quote',
        },
        error: undefined,
        status: 500,
      };

      mockApiClient.getDailyQuote.mockResolvedValue(mockError);

      await expect(MotivationalQuotesService.getDailyQuote()).rejects.toThrow(
        'Failed to fetch daily quote'
      );
    });
  });

  describe('getRandomQuote', () => {
    it('fetches random quote successfully', async () => {
      const mockQuote = {
        id: 2,
        text: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs',
        category: 'inspiration',
      };

      const mockResponse = {
        data: mockQuote,
        error: undefined,
        status: 200,
      };

      mockApiClient.getRandomQuote.mockResolvedValue(mockResponse);

      const result = await MotivationalQuotesService.getRandomQuote();

      expect(mockApiClient.getRandomQuote).toHaveBeenCalled();
      expect(result).toEqual(mockQuote);
    });
  });

  describe('getAllQuotes', () => {
    it('fetches all quotes successfully', async () => {
      const mockQuotes = [
        {
          id: 1,
          text: 'Quote 1',
          author: 'Author 1',
          category: 'motivation',
        },
        {
          id: 2,
          text: 'Quote 2',
          author: 'Author 2',
          category: 'inspiration',
        },
      ];

      const mockResponse = {
        data: mockQuotes,
        error: undefined,
        status: 200,
      };

      mockApiClient.getAllQuotes.mockResolvedValue(mockResponse);

      const result = await MotivationalQuotesService.getAllQuotes();

      expect(mockApiClient.getAllQuotes).toHaveBeenCalled();
      expect(result).toEqual(mockQuotes);
    });
  });

  describe('getQuotesByCategory', () => {
    it('fetches quotes by category successfully', async () => {
      const category = 'motivation';
      const mockQuotes = [
        {
          id: 1,
          text: 'Motivational quote 1',
          author: 'Author 1',
          category: 'motivation',
        },
      ];

      const mockResponse = {
        data: mockQuotes,
        error: undefined,
        status: 200,
      };

      mockApiClient.getQuotesByCategory.mockResolvedValue(mockResponse);

      const result =
        await MotivationalQuotesService.getQuotesByCategory(category);

      expect(mockApiClient.getQuotesByCategory).toHaveBeenCalledWith(category);
      expect(result).toEqual(mockQuotes);
    });
  });

  describe('getQuoteCategories', () => {
    it('fetches quote categories successfully', async () => {
      const mockCategories = ['motivation', 'inspiration', 'success'];

      const mockResponse = {
        data: mockCategories,
        error: undefined,
        status: 200,
      };

      mockApiClient.getQuoteCategories.mockResolvedValue(mockResponse);

      const result = await MotivationalQuotesService.getCategories();

      expect(mockApiClient.getQuoteCategories).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getQuoteById', () => {
    it('fetches quote by ID successfully', async () => {
      const quoteId = 1;
      const mockQuote = {
        id: 1,
        text: 'Specific quote',
        author: 'Specific Author',
        category: 'motivation',
      };

      const mockResponse = {
        data: mockQuote,
        error: undefined,
        status: 200,
      };

      mockApiClient.getQuoteById.mockResolvedValue(mockResponse);

      const result = await MotivationalQuotesService.getQuoteById(quoteId);

      expect(mockApiClient.getQuoteById).toHaveBeenCalledWith(quoteId);
      expect(result).toEqual(mockQuote);
    });
  });
});
