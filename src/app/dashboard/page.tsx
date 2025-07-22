'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { AuthGuard } from '@/components/auth';
import { CoachFeedbackWidget } from '@/components/dashboard/coach-feedback-widget';
import { HealthMetricsWidget } from '@/components/dashboard/health-metrics-widget';
import { JournalProgressWidget } from '@/components/dashboard/journal-progress-widget';
import { TeamChallengesWidget } from '@/components/dashboard/team-challenges-widget';
import { PageLayout } from '@/components/layout/page-layout';
import { PWAInstaller } from '@/components/pwa-installer';
import { QuestsWidget } from '@/components/quest/quests-widget';
import { TeamLeaderboardWidget } from '@/components/team/team-leaderboard-widget';
import { useAuth } from '@/hooks/use-auth';
import { useUserTeams } from '@/hooks/use-team-api';
import { trackPageView, trackWidgetInteraction } from '@/lib/analytics';
// import { useJournalStatus } from '@/hooks/use-journal-status';
import { logger } from '@/lib/logger';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Use our new service layer for teams
  const {
    data: teamsResponse,
    isLoading: teamsLoading,
    error: teamsError,
  } = useUserTeams(user?.id || null);

  const teams = React.useMemo(
    () => teamsResponse?.data || [],
    [teamsResponse?.data]
  );

  // Debug logging for teams
  useEffect(() => {
    logger.debug('🏈 Dashboard teams debug:', {
      userId: user?.id,
      teamsLoading,
      teamsError,
      teamsResponse,
      teamsCount: teams.length,
      teams,
    });
  }, [user?.id, teamsLoading, teamsError, teamsResponse, teams]);

  // Track dashboard page view
  useEffect(() => {
    if (user?.id) {
      trackPageView('dashboard', {
        user_id: user.id,
        teams_count: teams.length,
      });
    }
  }, [user?.id, teams.length]);

  const handleWidgetInteraction = (widget: string, action: string) => {
    trackWidgetInteraction(widget, action, {
      user_id: user?.id,
      page: 'dashboard',
    });
  };

  return (
    <AuthGuard>
      <PageLayout
        title={`Welcome back, ${user?.name || 'Athlete'}!`}
        subtitle='Ready to crush your goals today?'
      >
        {/* PWA Installer - only for authenticated users */}
        <PWAInstaller />

        {/* Dashboard Content */}
        <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {/* Top Row - Fixed height based on journal progress widget */}
            <div className='h-[500px]'>
              <QuestsWidget
                userId={user?.id || ''}
                onViewAll={() => {
                  handleWidgetInteraction('quests', 'view_all');
                  router.push('/quests');
                }}
              />
            </div>

            <div className='h-[500px]'>
              <JournalProgressWidget
                userId={user?.id || ''}
                onViewAll={() => {
                  handleWidgetInteraction('journal_progress', 'view_all');
                  logger.debug('📅 Journal progress view all clicked');
                  router.push('/journal');
                }}
              />
            </div>

            <div className='h-[500px]'>
              <TeamLeaderboardWidget
                userId={user?.id || ''}
                teams={teams}
                onViewAll={() => {
                  handleWidgetInteraction('team_leaderboard', 'view_all');
                  router.push('/team');
                }}
              />
            </div>

            {/* Bottom Row - Fixed height based on health metrics widget */}
            <div className='h-[400px]'>
              <TeamChallengesWidget userId={user?.id || ''} />
            </div>

            <div className='h-[400px]'>
              <CoachFeedbackWidget
                userId={user?.id || ''}
                onViewAll={() => {
                  handleWidgetInteraction('coach_feedback', 'view_all');
                  logger.debug('Coach feedback view all clicked');
                  router.push('/coaching');
                }}
              />
            </div>

            <div className='h-[400px]'>
              <HealthMetricsWidget
                userId={user?.id || ''}
                onViewAll={() => {
                  handleWidgetInteraction('health_metrics', 'view_all');
                  logger.debug('Health metrics view all clicked');
                  // TODO: Navigate to health page when implemented
                }}
              />
            </div>
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
