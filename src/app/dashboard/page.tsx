'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { CoachFeedbackWidget } from '@/components/dashboard/coach-feedback-widget';
import { GoalsWidget } from '@/components/dashboard/goals-widget';
import { HealthMetricsWidget } from '@/components/dashboard/health-metrics-widget';
import { JournalProgressWidget } from '@/components/dashboard/journal-progress-widget';
import { PageLayout } from '@/components/layout/page-layout';
import { PWAInstaller } from '@/components/pwa-installer';
import { QuestsWidget } from '@/components/quest/quests-widget';
import { TeamLeaderboardWidget } from '@/components/team/team-leaderboard-widget';
import { useAuth } from '@/hooks/use-auth';
import { useUserTeams } from '@/hooks/use-team-api';
// import { useJournalStatus } from '@/hooks/use-journal-status';
import { logger } from '@/lib/logger';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  // Get journal status for the user (unused but kept for future reference)
  // const journalStatus = useJournalStatus(user?.id || '');

  // Use our new service layer for teams
  const {
    data: teamsResponse,
    isLoading: teamsLoading,
    error: teamsError,
  } = useUserTeams(user?.id || null);

  const teams = React.useMemo(() => teamsResponse?.data || [], [teamsResponse?.data]);

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

  useEffect(() => {
    logger.debug('🏠 Dashboard auth effect:', {
      isLoading,
      isAuthenticated,
      hasUser: !!user,
      userId: user?.id,
      retryCount,
      isInitialLoad,
    });

    // Give some time for auth to initialize on first load
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 1000); // Wait 1 second on initial load
      return () => clearTimeout(timer);
    }

    if (!isLoading && !isAuthenticated && !isInitialLoad) {
      // If we've retried a few times and still no auth, redirect
      if (retryCount < 3) {
        logger.debug('🔄 Dashboard: Auth not ready, retrying...', {
          retryCount,
        });
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        logger.debug(
          '🚫 Dashboard: User not authenticated after retries, redirecting to home'
        );
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, router, user, retryCount, isInitialLoad]);

  if (isLoading || isInitialLoad) {
    logger.debug('⏳ Dashboard: Showing loading state');
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-secondary-600'></div>
          <p className='mt-4 text-gray-600 dark:text-gray-400'>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    logger.debug('🚫 Dashboard: Not authenticated, will redirect');
    return null; // Will redirect to home
  }

  logger.debug('✅ Dashboard: Rendering for authenticated user', {
    userId: user.id,
  });

  return (
    <PageLayout
      title={`Welcome back, ${user.name}!`}
      subtitle='Ready to crush your goals today?'
    >
      {/* PWA Installer - only for authenticated users */}
      <PWAInstaller />

      {/* Dashboard Content */}
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Today's Quests */}
          <QuestsWidget
            userId={user.id}
            onViewAll={() => router.push('/quests')}
          />

          {/* Journal Progress */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/20'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold dark:text-white'>
                Journal Progress
              </h3>
              <button
                onClick={() => router.push('/journal')}
                className='text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
              >
                View All →
              </button>
            </div>
            <div className='space-y-3'>
              <JournalProgressWidget
                userId={user.id}
                onViewAll={() => {
                  logger.debug('📅 Journal progress view all clicked');
                  router.push('/journal');
                }}
              />
            </div>
          </div>

          {/* Coach Feedback */}
          <CoachFeedbackWidget
            userId={user.id}
            onViewAll={() => {
              logger.debug('Coach feedback view all clicked');
              router.push('/coaching');
            }}
          />

          {/* Health Metrics */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/20'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold dark:text-white'>
                Health Metrics
              </h3>
              <button
                onClick={() => {
                  logger.debug('Health metrics view all clicked');
                  // TODO: Navigate to health page when implemented
                }}
                className='text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
              >
                View All →
              </button>
            </div>
            <div className='space-y-3'>
              <HealthMetricsWidget
                userId={user.id}
                onViewAll={() => {
                  logger.debug('Health metrics view all clicked');
                  // TODO: Navigate to health page when implemented
                }}
              />
            </div>
          </div>

          {/* Team Leaderboard */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/20'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold dark:text-white'>
                Team Leaderboard
              </h3>
              <button
                onClick={() => router.push('/team')}
                className='text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
              >
                View All →
              </button>
            </div>
            <div className='space-y-3'>
              <TeamLeaderboardWidget userId={user?.id || ''} teams={teams} />
            </div>
          </div>

          {/* Goals */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/20'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold dark:text-white'>
                Your Goals
              </h3>
              <button
                onClick={() => {
                  logger.debug('Goals view all clicked');
                  // TODO: Navigate to goals page when implemented
                }}
                className='text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
              >
                View All →
              </button>
            </div>
            <div className='space-y-3'>
              <GoalsWidget
                userId={user.id}
                onViewAll={() => {
                  logger.debug('Goals view all clicked');
                  // TODO: Navigate to goals page when implemented
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
