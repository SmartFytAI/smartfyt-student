/**
 * API Client for SmartFyt Student App
 * Connects to the independent smartfyt-api backend
 */

import type { QuestResponse, UserStat } from '@/types';

import { logger } from './logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;
  private getToken?: () => Promise<string | null>;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  setTokenProvider(getToken: () => Promise<string | null>) {
    this.getToken = getToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Try to get token from provider first, then fallback to stored token
    let token = this.authToken;
    if (this.getToken) {
      try {
        const dynamicToken = await this.getToken();
        if (dynamicToken) {
          token = dynamicToken;
        }
      } catch (error) {
        logger.warn('⚠️ Failed to get dynamic token:', error);
      }
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const status = response.status;

      if (!response.ok) {
        const errorText = await response.text();
        return {
          error: errorText || `HTTP ${status}`,
          status,
        };
      }

      const data = await response.json();
      return { data, status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string; version: string }>(
      '/health'
    );
  }

  // Sports endpoints
  async getSports() {
    return this.request<Array<{ id: string; name: string }>>('/sports');
  }

  // Schools endpoints
  async getSchools() {
    return this.request<Array<{ id: string; name: string }>>('/schools');
  }

  // User endpoints
  async getUserData(userId: string) {
    return this.request(`/users/${userId}/data`);
  }

  async getUserInfo(userId: string) {
    return this.request(`/users/${userId}/info`);
  }

  // Health data endpoints
  async getHealthData(userId: string) {
    return this.request(`/users/${userId}/health`);
  }

  // Journal endpoints
  async getJournals(userId: string, queryParams?: string) {
    const endpoint = queryParams
      ? `/users/${userId}/journals?${queryParams}`
      : `/users/${userId}/journals`;
    return this.request(endpoint);
  }

  async getJournalDates(userId: string) {
    return this.request<string[]>(`/users/${userId}/journals/dates`);
  }

  async getJournalForDate(userId: string, date: string) {
    return this.request(`/users/${userId}/journals/date/${date}`);
  }

  async createJournal(journalData: {
    userId: string;
    title: string;
    wentWell?: string;
    notWell?: string;
    goals?: string;
    sleepHours?: number;
    activeHours?: number;
    stress?: number;
    screenTime?: number;
    studyHours?: number;
  }) {
    return this.request('/journals', {
      method: 'POST',
      body: JSON.stringify(journalData),
    });
  }

  // Quest endpoints
  async getUserQuests(userId: string) {
    return this.request<QuestResponse[]>(`/users/${userId}/quests`);
  }

  async getUserStats(userId: string) {
    return this.request<UserStat[]>(`/users/${userId}/stats`);
  }

  async completeQuest(userId: string, questId: string, notes: string) {
    return this.request(`/users/${userId}/quests/complete`, {
      method: 'POST',
      body: JSON.stringify({ questId, notes }),
    });
  }

  async getCompletedQuests(userId: string) {
    return this.request<QuestResponse[]>(`/users/${userId}/quests/completed`);
  }

  async assignQuests(userId: string) {
    return this.request<QuestResponse[]>(`/users/${userId}/quests/assign`, {
      method: 'POST',
    });
  }

  async getQuestCategories() {
    return this.request('/quests/categories');
  }

  // Leaderboard endpoints
  async getTeamLeaderboard(teamId: string) {
    return this.request<
      Array<{
        id: string;
        firstName: string;
        lastName: string;
        profileImage: string;
        performanceScore: number;
        trend: 'up' | 'down' | 'none';
      }>
    >(`/teams/${teamId}/leaderboard`);
  }

  async getSchoolLeaderboard(userId: string) {
    return this.request<
      Array<{
        id: string;
        firstName: string;
        lastName: string;
        profileImage: string;
        performanceScore: number;
        trend: 'up' | 'down' | 'none';
      }>
    >(`/users/${userId}/school/leaderboard`);
  }

  // Forms endpoints
  async getUserForms(userId: string) {
    return this.request(`/users/${userId}/forms`);
  }

  // Dashboard endpoint
  async getDashboard(userId: string) {
    return this.request(`/users/${userId}/dashboard`);
  }

  // Teams endpoints
  async getUserTeams(userId: string) {
    return this.request<
      Array<{
        id: string;
        name: string;
        sportID: string;
        schoolID?: string;
        sport: { id: string; name: string };
        school?: { id: string; name: string };
      }>
    >(`/users/${userId}/teams`);
  }

  // Metrics endpoints
  async getUserMetrics(userId: string) {
    return this.request(`/users/${userId}/metrics`);
  }

  // Motivational quotes endpoints (public - no authentication required)
  async getDailyQuote() {
    try {
      const url = `${this.baseUrl}/api/motivational-quotes/daily`;
      logger.info(
        '🌐 API Client: Making GET request to motivational quotes daily endpoint',
        {
          url,
          baseUrl: this.baseUrl,
          timestamp: new Date().toISOString(),
        }
      );

      const response = await fetch(url);

      logger.debug('🌐 API Client: Response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
      });

      const data = await response.json();

      logger.debug('🌐 API Client: Response data parsed', {
        success: data.success,
        hasData: !!data.data,
        hasError: !!data.error,
        dataType: typeof data.data,
      });

      return { data, status: response.status };
    } catch (error) {
      logger.error('❌ API Client: Error in getDailyQuote', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  async getRandomQuote() {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/motivational-quotes/random`
      );
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  async getAllQuotes() {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/motivational-quotes/all`
      );
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  async getQuotesByCategory(category: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/motivational-quotes/category?category=${encodeURIComponent(category)}`
      );
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  async getQuoteCategories() {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/motivational-quotes/categories`
      );
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  async getQuoteById(id: number) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/motivational-quotes/${id}`
      );
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export API endpoints as constants for React Query keys
export const API_ENDPOINTS = {
  HEALTH: '/health',
  SPORTS: '/sports',
  SCHOOLS: '/schools',
  USER_DATA: (userId: string) => `/users/${userId}/data`,
  USER_INFO: (userId: string) => `/users/${userId}/info`,
  HEALTH_DATA: (userId: string) => `/users/${userId}/health`,
  JOURNALS: (userId: string) => `/users/${userId}/journals`,
  JOURNAL_DATES: (userId: string) => `/users/${userId}/journals/dates`,
  CREATE_JOURNAL: '/journals',
  USER_QUESTS: (userId: string) => `/users/${userId}/quests`,
  USER_STATS: (userId: string) => `/users/${userId}/stats`,
  COMPLETE_QUEST: (userId: string, questId: string) =>
    `/users/${userId}/quests/${questId}/complete`,
  COMPLETED_QUESTS: (userId: string) => `/users/${userId}/quests/completed`,
  QUEST_CATEGORIES: '/quests/categories',
  USER_FORMS: (userId: string) => `/users/${userId}/forms`,
  DASHBOARD: (userId: string) => `/users/${userId}/dashboard`,
  USER_METRICS: (userId: string) => `/users/${userId}/metrics`,
  MOTIVATIONAL_QUOTES_DAILY: '/api/motivational-quotes/daily',
  MOTIVATIONAL_QUOTES_RANDOM: '/api/motivational-quotes/random',
  MOTIVATIONAL_QUOTES_ALL: '/api/motivational-quotes/all',
  MOTIVATIONAL_QUOTES_CATEGORIES: '/api/motivational-quotes/categories',
  MOTIVATIONAL_QUOTES_BY_ID: (id: number) => `/api/motivational-quotes/${id}`,
  MOTIVATIONAL_QUOTES_BY_CATEGORY: (category: string) =>
    `/api/motivational-quotes/category?category=${encodeURIComponent(category)}`,
} as const;
