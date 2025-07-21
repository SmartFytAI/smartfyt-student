import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the analytics functions with inline factory
vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
  trackPageView: vi.fn(),
  trackFeatureUsage: vi.fn(),
  trackWidgetInteraction: vi.fn(),
  trackQuestInteraction: vi.fn(),
  trackJournalInteraction: vi.fn(),
  trackTeamInteraction: vi.fn(),
  trackHealthInteraction: vi.fn(),
  trackCoachFeedbackInteraction: vi.fn(),
  trackAuthEvent: vi.fn(),
  trackError: vi.fn(),
}));

import * as analytics from '@/lib/analytics';
import { useAnalytics } from '../use-analytics';

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock user context
    mockUseAuth.mockReturnValue({
      user: { id: '123', email: 'test@example.com' },
    });
  });

  describe('trackEvent', () => {
    it('calls trackEvent with correct parameters', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackEvent('test_event', { key: 'value' });
      });

      expect(analytics.trackEvent).toHaveBeenCalledWith('test_event', {
        key: 'value',
        user_id: '123',
        user_email: 'test@example.com',
      });
    });

    it('handles missing properties gracefully', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackEvent('test_event');
      });

      expect(analytics.trackEvent).toHaveBeenCalledWith('test_event', {
        user_id: '123',
        user_email: 'test@example.com',
      });
    });
  });

  describe('trackPageView', () => {
    it('calls trackPageView with correct parameters', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackPageView('dashboard', { user_id: '123' });
      });

      expect(analytics.trackPageView).toHaveBeenCalledWith('dashboard', {
        user_id: '123',
        user_email: 'test@example.com',
      });
    });
  });

  describe('trackFeatureUsage', () => {
    it('calls trackFeatureUsage with default action', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackFeatureUsage('quest_completion');
      });

      expect(analytics.trackFeatureUsage).toHaveBeenCalledWith(
        'quest_completion',
        undefined,
        {
          user_id: '123',
          user_email: 'test@example.com',
        }
      );
    });

    it('calls trackFeatureUsage with custom action and properties', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackFeatureUsage('quest_completion', 'submit', {
          quest_id: '456',
        });
      });

      expect(analytics.trackFeatureUsage).toHaveBeenCalledWith(
        'quest_completion',
        'submit',
        {
          quest_id: '456',
          user_id: '123',
          user_email: 'test@example.com',
        }
      );
    });
  });

  describe('trackWidgetInteraction', () => {
    it('calls trackWidgetInteraction with correct parameters', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackWidgetInteraction('health_widget', 'view', {
          widget_type: 'health',
        });
      });

      expect(analytics.trackWidgetInteraction).toHaveBeenCalledWith(
        'health_widget',
        'view',
        {
          widget_type: 'health',
          user_id: '123',
          user_email: 'test@example.com',
        }
      );
    });
  });

  describe('trackQuestInteraction', () => {
    it('calls trackQuestInteraction with correct parameters', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackQuestInteraction('quest_complete', '123', {
          points: 100,
        });
      });

      expect(analytics.trackQuestInteraction).toHaveBeenCalledWith(
        'quest_complete',
        '123',
        {
          points: 100,
          user_id: '123',
          user_email: 'test@example.com',
        }
      );
    });
  });

  describe('trackJournalInteraction', () => {
    it('calls trackJournalInteraction with correct parameters', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackJournalInteraction('entry_create', {
          entry_type: 'daily',
        });
      });

      expect(analytics.trackJournalInteraction).toHaveBeenCalledWith(
        'entry_create',
        {
          entry_type: 'daily',
          user_id: '123',
          user_email: 'test@example.com',
        }
      );
    });
  });

  describe('trackTeamInteraction', () => {
    it('calls trackTeamInteraction with correct parameters', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackTeamInteraction('leaderboard_view', '456');
      });

      expect(analytics.trackTeamInteraction).toHaveBeenCalledWith(
        'leaderboard_view',
        '456',
        {
          user_id: '123',
          user_email: 'test@example.com',
        }
      );
    });
  });

  describe('trackHealthInteraction', () => {
    it('calls trackHealthInteraction with correct parameters', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackHealthInteraction('metrics_view', 'steps');
      });

      expect(analytics.trackHealthInteraction).toHaveBeenCalledWith(
        'metrics_view',
        'steps',
        {
          user_id: '123',
          user_email: 'test@example.com',
        }
      );
    });
  });

  describe('trackCoachFeedbackInteraction', () => {
    it('calls trackCoachFeedbackInteraction with correct parameters', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackCoachFeedbackInteraction('feedback_view', {
          coach_type: 'ai',
        });
      });

      expect(analytics.trackCoachFeedbackInteraction).toHaveBeenCalledWith(
        'feedback_view',
        {
          coach_type: 'ai',
          user_id: '123',
          user_email: 'test@example.com',
        }
      );
    });
  });

  describe('trackAuthEvent', () => {
    it('calls trackAuthEvent with correct parameters', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackAuthEvent('login_success', { method: 'email' });
      });

      expect(analytics.trackAuthEvent).toHaveBeenCalledWith('login_success', {
        method: 'email',
        user_id: '123',
        user_email: 'test@example.com',
      });
    });
  });

  describe('trackError', () => {
    it('calls trackError with correct parameters', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackError('Test error', 'api_error', {
          endpoint: '/api/health',
        });
      });

      expect(analytics.trackError).toHaveBeenCalledWith(
        'Test error',
        'api_error',
        {
          endpoint: '/api/health',
          user_id: '123',
          user_email: 'test@example.com',
        }
      );
    });
  });
});
