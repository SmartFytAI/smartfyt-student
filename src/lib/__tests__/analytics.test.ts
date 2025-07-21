import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock posthog with inline factory
vi.mock('posthog-js', () => ({
  default: {
    capture: vi.fn(),
  },
}));

import posthog from 'posthog-js';
import {
  trackEvent,
  trackPageView,
  trackFeatureUsage,
  trackWidgetInteraction,
  trackQuestInteraction,
  trackJournalInteraction,
  trackTeamInteraction,
  trackHealthInteraction,
  trackCoachFeedbackInteraction,
  trackAuthEvent,
  trackError,
} from '../analytics';

describe('Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variables
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('trackEvent', () => {
    it('calls posthog.capture with correct parameters', () => {
      trackEvent('test_event', { key: 'value' });

      expect(posthog.capture).toHaveBeenCalledWith('test_event', {
        key: 'value',
        timestamp: expect.any(String),
      });
    });

    it('handles missing properties gracefully', () => {
      trackEvent('test_event');

      expect(posthog.capture).toHaveBeenCalledWith('test_event', {
        timestamp: expect.any(String),
      });
    });

    it('does not track in development when no key is provided', () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', '');

      trackEvent('test_event', { key: 'value' });

      expect(posthog.capture).not.toHaveBeenCalled();
    });

    it('handles posthog errors gracefully', () => {
      vi.mocked(posthog.capture).mockImplementation(() => {
        throw new Error('PostHog error');
      });

      expect(() => trackEvent('test_event')).not.toThrow();
    });
  });

  describe('trackPageView', () => {
    it('tracks page view with correct parameters', () => {
      trackPageView('dashboard', { user_id: '123' });

      expect(posthog.capture).toHaveBeenCalledWith('page_view', {
        page_name: 'dashboard',
        user_id: '123',
        timestamp: expect.any(String),
      });
    });
  });

  describe('trackFeatureUsage', () => {
    it('tracks feature usage with default action', () => {
      trackFeatureUsage('quest_completion');

      expect(posthog.capture).toHaveBeenCalledWith('feature_used', {
        feature: 'quest_completion',
        action: 'click',
        timestamp: expect.any(String),
      });
    });

    it('tracks feature usage with custom action', () => {
      trackFeatureUsage('quest_completion', 'submit', { quest_id: '456' });

      expect(posthog.capture).toHaveBeenCalledWith('feature_used', {
        feature: 'quest_completion',
        action: 'submit',
        quest_id: '456',
        timestamp: expect.any(String),
      });
    });
  });

  describe('trackWidgetInteraction', () => {
    it('tracks widget interaction', () => {
      trackWidgetInteraction('health_widget', 'view', {
        widget_type: 'health',
      });

      expect(posthog.capture).toHaveBeenCalledWith('widget_interaction', {
        widget: 'health_widget',
        action: 'view',
        widget_type: 'health',
        timestamp: expect.any(String),
      });
    });
  });

  describe('trackQuestInteraction', () => {
    it('tracks quest interaction', () => {
      trackQuestInteraction('quest_complete', '123', { points: 100 });

      expect(posthog.capture).toHaveBeenCalledWith('quest_interaction', {
        action: 'quest_complete',
        quest_id: '123',
        points: 100,
        timestamp: expect.any(String),
      });
    });
  });

  describe('trackJournalInteraction', () => {
    it('tracks journal interaction', () => {
      trackJournalInteraction('entry_create', { entry_type: 'daily' });

      expect(posthog.capture).toHaveBeenCalledWith('journal_interaction', {
        action: 'entry_create',
        entry_type: 'daily',
        timestamp: expect.any(String),
      });
    });
  });

  describe('trackTeamInteraction', () => {
    it('tracks team interaction', () => {
      trackTeamInteraction('leaderboard_view', '456');

      expect(posthog.capture).toHaveBeenCalledWith('team_interaction', {
        action: 'leaderboard_view',
        team_id: '456',
        timestamp: expect.any(String),
      });
    });
  });

  describe('trackHealthInteraction', () => {
    it('tracks health interaction', () => {
      trackHealthInteraction('metrics_view', 'steps');

      expect(posthog.capture).toHaveBeenCalledWith('health_interaction', {
        action: 'metrics_view',
        data_type: 'steps',
        timestamp: expect.any(String),
      });
    });
  });

  describe('trackCoachFeedbackInteraction', () => {
    it('tracks coach feedback interaction', () => {
      trackCoachFeedbackInteraction('feedback_view', { coach_type: 'ai' });

      expect(posthog.capture).toHaveBeenCalledWith(
        'coach_feedback_interaction',
        {
          action: 'feedback_view',
          coach_type: 'ai',
          timestamp: expect.any(String),
        }
      );
    });
  });

  describe('trackAuthEvent', () => {
    it('tracks auth event', () => {
      trackAuthEvent('login_success', { method: 'email' });

      expect(posthog.capture).toHaveBeenCalledWith('auth_event', {
        action: 'login_success',
        method: 'email',
        timestamp: expect.any(String),
      });
    });
  });

  describe('trackError', () => {
    it('tracks error event', () => {
      trackError('Test error', 'api_error', { endpoint: '/api/health' });

      expect(posthog.capture).toHaveBeenCalledWith('error', {
        error: 'Test error',
        context: 'api_error',
        endpoint: '/api/health',
        timestamp: expect.any(String),
      });
    });
  });
});
