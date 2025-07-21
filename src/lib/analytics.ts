import posthog from 'posthog-js';

/**
 * Lightweight analytics utility for tracking user interactions
 * Designed to be fast and non-intrusive
 */

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

/**
 * Track a feature click or user interaction
 */
export function trackEvent(event: string, properties?: Record<string, any>) {
  try {
    // Only track in production or when PostHog is enabled
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture(event, {
        ...properties,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    // Silently fail to avoid breaking the app
    console.warn('Analytics tracking failed:', error);
  }
}

/**
 * Track page navigation
 */
export function trackPageView(pageName: string, properties?: Record<string, any>) {
  trackEvent('page_view', {
    page_name: pageName,
    ...properties,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(feature: string, action?: string, properties?: Record<string, any>) {
  trackEvent('feature_used', {
    feature,
    action: action || 'click',
    ...properties,
  });
}

/**
 * Track widget interactions
 */
export function trackWidgetInteraction(widget: string, action: string, properties?: Record<string, any>) {
  trackEvent('widget_interaction', {
    widget,
    action,
    ...properties,
  });
}

/**
 * Track quest interactions
 */
export function trackQuestInteraction(action: string, questId?: string, properties?: Record<string, any>) {
  trackEvent('quest_interaction', {
    action,
    quest_id: questId,
    ...properties,
  });
}

/**
 * Track journal interactions
 */
export function trackJournalInteraction(action: string, properties?: Record<string, any>) {
  trackEvent('journal_interaction', {
    action,
    ...properties,
  });
}

/**
 * Track team interactions
 */
export function trackTeamInteraction(action: string, teamId?: string, properties?: Record<string, any>) {
  trackEvent('team_interaction', {
    action,
    team_id: teamId,
    ...properties,
  });
}

/**
 * Track health data interactions
 */
export function trackHealthInteraction(action: string, dataType?: string, properties?: Record<string, any>) {
  trackEvent('health_interaction', {
    action,
    data_type: dataType,
    ...properties,
  });
}

/**
 * Track coach feedback interactions
 */
export function trackCoachFeedbackInteraction(action: string, properties?: Record<string, any>) {
  trackEvent('coach_feedback_interaction', {
    action,
    ...properties,
  });
}

/**
 * Track authentication events
 */
export function trackAuthEvent(action: string, properties?: Record<string, any>) {
  trackEvent('auth_event', {
    action,
    ...properties,
  });
}

/**
 * Track error events
 */
export function trackError(error: string, context?: string, properties?: Record<string, any>) {
  trackEvent('error', {
    error,
    context,
    ...properties,
  });
} 