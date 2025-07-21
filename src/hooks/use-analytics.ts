import { useAuth } from '@/hooks/use-auth';
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
} from '@/lib/analytics';

/**
 * Custom hook for analytics tracking with user context
 */
export function useAnalytics() {
  const { user } = useAuth();

  const withUserContext = (properties: Record<string, any> = {}) => ({
    user_id: user?.id,
    user_email: user?.email,
    ...properties,
  });

  return {
    // Basic tracking
    trackEvent: (event: string, properties?: Record<string, any>) =>
      trackEvent(event, withUserContext(properties)),

    // Page tracking
    trackPageView: (pageName: string, properties?: Record<string, any>) =>
      trackPageView(pageName, withUserContext(properties)),

    // Feature tracking
    trackFeatureUsage: (
      feature: string,
      action?: string,
      properties?: Record<string, any>
    ) => trackFeatureUsage(feature, action, withUserContext(properties)),

    // Widget tracking
    trackWidgetInteraction: (
      widget: string,
      action: string,
      properties?: Record<string, any>
    ) => trackWidgetInteraction(widget, action, withUserContext(properties)),

    // Quest tracking
    trackQuestInteraction: (
      action: string,
      questId?: string,
      properties?: Record<string, any>
    ) => trackQuestInteraction(action, questId, withUserContext(properties)),

    // Journal tracking
    trackJournalInteraction: (
      action: string,
      properties?: Record<string, any>
    ) => trackJournalInteraction(action, withUserContext(properties)),

    // Team tracking
    trackTeamInteraction: (
      action: string,
      teamId?: string,
      properties?: Record<string, any>
    ) => trackTeamInteraction(action, teamId, withUserContext(properties)),

    // Health tracking
    trackHealthInteraction: (
      action: string,
      dataType?: string,
      properties?: Record<string, any>
    ) => trackHealthInteraction(action, dataType, withUserContext(properties)),

    // Coach feedback tracking
    trackCoachFeedbackInteraction: (
      action: string,
      properties?: Record<string, any>
    ) => trackCoachFeedbackInteraction(action, withUserContext(properties)),

    // Auth tracking
    trackAuthEvent: (action: string, properties?: Record<string, any>) =>
      trackAuthEvent(action, withUserContext(properties)),

    // Error tracking
    trackError: (
      error: string,
      context?: string,
      properties?: Record<string, any>
    ) => trackError(error, context, withUserContext(properties)),
  };
}
