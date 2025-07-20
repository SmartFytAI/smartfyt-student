import { apiClient } from '../api-client';
import { logger } from '../logger';

export interface MotivationalQuote {
  id: number;
  quote: string;
  author: string;
  category: string;
}

export interface QuotesResponse {
  success: boolean;
  data?: MotivationalQuote | MotivationalQuote[];
  error?: string;
}

export class MotivationalQuotesService {
  /**
   * Get the daily quote (based on current date)
   */
  static async getDailyQuote(): Promise<MotivationalQuote> {
    try {
      logger.info('📖 Fetching daily motivational quote from API');
      logger.debug('📖 API call details:', {
        endpoint: '/api/motivational-quotes/daily',
        timestamp: new Date().toISOString(),
      });

      const response = await apiClient.getDailyQuote();

      logger.debug('📖 API response received:', {
        status: response.status,
        hasData: !!response.data,
        hasError: !!response.error,
        dataType: typeof response.data,
        responseData: response.data,
      });

      if (response.error) {
        logger.error('❌ Failed to fetch daily quote:', {
          error: response.error,
          status: response.status,
        });
        throw new Error(response.error);
      }

      // Handle nested response structure
      const apiResponse = response.data;
      if (!apiResponse || !apiResponse.success) {
        logger.error('❌ API returned unsuccessful response:', {
          apiResponse,
          status: response.status,
        });
        throw new Error(
          apiResponse?.error || 'API returned unsuccessful response'
        );
      }

      const quote = apiResponse.data as MotivationalQuote;
      if (!quote) {
        logger.error('❌ No quote data in API response:', { apiResponse });
        throw new Error('No quote data in API response');
      }

      logger.info('✅ Daily quote fetched successfully:', {
        quoteId: quote.id,
        author: quote.author,
        category: quote.category,
        quotePreview: quote.quote.substring(0, 50) + '...',
      });

      return quote;
    } catch (error) {
      logger.error('❌ Motivational quotes service error:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Get a random quote
   */
  static async getRandomQuote(): Promise<MotivationalQuote> {
    try {
      logger.debug('📖 Fetching random motivational quote');

      const response = await apiClient.getRandomQuote();

      if (response.error) {
        logger.error('❌ Failed to fetch random quote:', {
          error: response.error,
        });
        throw new Error(response.error);
      }

      const quote = response.data as MotivationalQuote;
      logger.debug('✅ Random quote fetched successfully:', {
        quoteId: quote.id,
        author: quote.author,
      });

      return quote;
    } catch (error) {
      logger.error('❌ Motivational quotes service error:', { error });
      throw error;
    }
  }

  /**
   * Get all quotes
   */
  static async getAllQuotes(): Promise<MotivationalQuote[]> {
    try {
      logger.debug('📖 Fetching all motivational quotes');

      const response = await apiClient.getAllQuotes();

      if (response.error) {
        logger.error('❌ Failed to fetch all quotes:', {
          error: response.error,
        });
        throw new Error(response.error);
      }

      const quotes = response.data as MotivationalQuote[];
      logger.debug('✅ All quotes fetched successfully:', {
        count: quotes.length,
      });

      return quotes;
    } catch (error) {
      logger.error('❌ Motivational quotes service error:', { error });
      throw error;
    }
  }

  /**
   * Get quotes by category
   */
  static async getQuotesByCategory(
    category: string
  ): Promise<MotivationalQuote[]> {
    try {
      logger.debug('📖 Fetching quotes by category:', { category });

      const response = await apiClient.getQuotesByCategory(category);

      if (response.error) {
        logger.error('❌ Failed to fetch quotes by category:', {
          error: response.error,
          category,
        });
        throw new Error(response.error);
      }

      const quotes = response.data as MotivationalQuote[];
      logger.debug('✅ Quotes by category fetched successfully:', {
        category,
        count: quotes.length,
      });

      return quotes;
    } catch (error) {
      logger.error('❌ Motivational quotes service error:', {
        error,
        category,
      });
      throw error;
    }
  }

  /**
   * Get available categories
   */
  static async getCategories(): Promise<string[]> {
    try {
      logger.debug('📖 Fetching motivational quote categories');

      const response = await apiClient.getQuoteCategories();

      if (response.error) {
        logger.error('❌ Failed to fetch categories:', {
          error: response.error,
        });
        throw new Error(response.error);
      }

      const categories = response.data as string[];
      logger.debug('✅ Categories fetched successfully:', {
        count: categories.length,
        categories,
      });

      return categories;
    } catch (error) {
      logger.error('❌ Motivational quotes service error:', { error });
      throw error;
    }
  }

  /**
   * Get quote by ID
   */
  static async getQuoteById(id: number): Promise<MotivationalQuote> {
    try {
      logger.debug('📖 Fetching quote by ID:', { id });

      const response = await apiClient.getQuoteById(id);

      if (response.error) {
        logger.error('❌ Failed to fetch quote by ID:', {
          error: response.error,
          id,
        });
        throw new Error(response.error);
      }

      const quote = response.data as MotivationalQuote;
      logger.debug('✅ Quote by ID fetched successfully:', {
        quoteId: quote.id,
        author: quote.author,
      });

      return quote;
    } catch (error) {
      logger.error('❌ Motivational quotes service error:', { error, id });
      throw error;
    }
  }

  /**
   * Get a fallback quote (used when API is unavailable)
   */
  static getFallbackQuote(): MotivationalQuote {
    return {
      id: 1,
      quote: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
      category: 'passion',
    };
  }
}
