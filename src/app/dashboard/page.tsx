'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { CoachFeedbackWidget } from '@/components/dashboard/coach-feedback-widget';
import { DashboardCalendar } from '@/components/journal/dashboard-calendar';
import { PageLayout } from '@/components/layout/page-layout';
import { PWAInstaller } from '@/components/pwa-installer';
import { QuestsWidget } from '@/components/quest/quests-widget';
import { TeamLeaderboardWidget } from '@/components/team/TeamLeaderboardWidget';
import { useAuth } from '@/hooks/use-auth';
// import { useJournalStatus } from '@/hooks/use-journal-status';
import { logger } from '@/lib/logger';
import type { Team } from '@/types';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  // Get journal status for the user (unused but kept for future reference)
  // const journalStatus = useJournalStatus(user?.id || '');

  // Fetch user teams when authenticated
  useEffect(() => {
    if (user?.id && isAuthenticated) {
      const fetchUserTeams = async () => {
        try {
          setTeamsLoading(true);
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}/teams`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('kinde_token')}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch teams');
          }

          const data = await response.json();
          setTeams(data || []);
          logger.info('User teams fetched for dashboard', {
            teamCount: data?.length || 0,
          });
        } catch (error) {
          logger.error('Failed to fetch user teams for dashboard', { error });
          // For demo purposes, show mock data
          setTeams([
            {
              id: 'team-1',
              name: 'Varsity Football',
              sportID: 'football',
              schoolID: 'school-1',
              sport: { id: 'football', name: 'Football' },
              school: { id: 'school-1', name: 'Lincoln High School' },
            },
            {
              id: 'team-2',
              name: 'JV Basketball',
              sportID: 'basketball',
              schoolID: 'school-1',
              sport: { id: 'basketball', name: 'Basketball' },
              school: { id: 'school-1', name: 'Lincoln High School' },
            },
          ]);
        } finally {
          setTeamsLoading(false);
        }
      };

      fetchUserTeams();
    }
  }, [user?.id, isAuthenticated]);

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
          <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
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

          {/* Journal Calendar */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/20'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold dark:text-white'>
                Journal Progress
              </h3>
              <button
                onClick={() => router.push('/journal')}
                className='text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
              >
                View All →
              </button>
            </div>
            <div className='space-y-4'>
              <DashboardCalendar
                userId={user.id}
                onDayClick={(date: Date) => {
                  logger.debug('📅 Dashboard calendar day clicked:', { date });
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
            <h3 className='mb-4 text-lg font-semibold dark:text-white'>
              Health Metrics
            </h3>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='dark:text-gray-300'>Sleep</span>
                <span className='font-semibold text-green-600 dark:text-green-400'>
                  8h
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='dark:text-gray-300'>Steps</span>
                <span className='font-semibold text-blue-600 dark:text-blue-400'>
                  6,420
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='dark:text-gray-300'>Hydration</span>
                <span className='font-semibold text-purple-600 dark:text-purple-400'>
                  64oz
                </span>
              </div>
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
                className='text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300'
              >
                View All →
              </button>
            </div>
            <div className='space-y-3'>
              {teamsLoading ? (
                <div className='py-6 text-center'>
                  <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-orange-600'></div>
                  <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
                    Loading teams...
                  </p>
                </div>
              ) : teams.length === 0 ? (
                <div className='py-6 text-center'>
                  <div className='mb-2 text-4xl'>🏆</div>
                  <p className='text-sm font-medium dark:text-gray-300'>
                    No Teams Yet
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Join a team to see the leaderboard
                  </p>
                </div>
              ) : (
                <TeamLeaderboardWidget userId={user?.id || ''} teams={teams} />
              )}
            </div>
          </div>

          {/* Goals */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/20'>
            <h3 className='mb-4 text-lg font-semibold dark:text-white'>
              Your Goals
            </h3>
            <div className='space-y-3'>
              <div className='rounded-md bg-blue-50 p-3 dark:bg-blue-900/20'>
                <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                  Improve 40-yard dash
                </p>
                <p className='text-xs text-blue-700 dark:text-blue-300'>
                  Target: 4.8s
                </p>
              </div>
              <div className='rounded-md bg-green-50 p-3 dark:bg-green-900/20'>
                <p className='text-sm font-medium text-green-900 dark:text-green-100'>
                  Maintain 3.5 GPA
                </p>
                <p className='text-xs text-green-700 dark:text-green-300'>
                  Current: 3.6
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
