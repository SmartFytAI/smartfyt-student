'use client';

import React, { useEffect } from 'react';

import { AuthGuard } from '@/components/auth';
import { PageLayout } from '@/components/layout/page-layout';
import { TeamLeaderboardWidget } from '@/components/team/team-leaderboard-widget';
import { useAuth } from '@/hooks/use-auth';
import { useUserTeams } from '@/hooks/use-team-api';
import { trackPageView } from '@/lib/analytics';
import { logger } from '@/lib/logger';

export default function TeamPage() {
  const { user } = useAuth();

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

  // Track team page view
  useEffect(() => {
    if (user?.id) {
      trackPageView('team', {
        user_id: user.id,
        teams_count: teams.length,
      });
    }
  }, [user?.id, teams.length]);

  const isLoading = teamsLoading;
  const error = teamsError ? 'Failed to load your teams' : null;

  // Log teams data for debugging
  if (teams.length > 0) {
    logger.info('Teams loaded successfully', {
      teamCount: teams.length,
      teams: teams.map((t: any) => ({ id: t.id, name: t.name })),
    });
  } else if (!isLoading && !error) {
    logger.info('No teams found for user', {
      userId: user?.id,
      userEmail: user?.email,
      authLoading: false, // Placeholder, as per new_code
      teamsLoading: false, // Placeholder, as per new_code
      teamsError: teamsError?.message,
      teamsResponse: teamsResponse,
    });
  }

  return (
    <AuthGuard>
      <PageLayout
        title='Team'
        subtitle='Connect with your teammates and compete together'
      >
        <div className='mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8'>
          {/* Team Leaderboard */}
          <TeamLeaderboardWidget userId={user?.id || ''} teams={teams} />

          {/* Show error state */}
          {error && (
            <div className='rounded-lg border border-danger-200 bg-danger-50 p-4 shadow-sm'>
              <div className='flex items-center'>
                <div className='text-danger-600'>
                  <svg
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-danger-800'>
                    Error Loading Teams
                  </h3>
                  <div className='mt-2 text-sm text-danger-700'>
                    <p>{error}</p>
                    <p>
                      Please try refreshing the page or contact support if the
                      problem persists.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show message when user has no teams */}
          {!isLoading && !error && teams.length === 0 && (
            <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
              <div className='flex items-center'>
                <div className='text-gray-600'>
                  <svg
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-gray-900'>
                    No Teams Found
                  </h3>
                  <div className='mt-2 text-sm text-gray-500'>
                    <p>
                      You&apos;re not currently part of any teams.
                    </p>
                    <p>
                      Teams will appear here once you&apos;re added by your coach
                      or administrator.
                    </p>
                  </div>
                  <div className='mt-4 text-xs text-gray-400'>
                    <p>User ID: {user?.id || 'Not available'}</p>
                    <p>Email: {user?.email || 'Not available'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Overview Cards */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
              <div className='mb-2 text-gray-500'>
                <svg
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h2a6 6 0 016 6v1H3'
                  />
                </svg>
              </div>
              <h4 className='mb-1 font-medium text-gray-900'>
                Total Teams
              </h4>
              <p className='text-2xl font-bold'>
                {isLoading ? '...' : teams.length}
              </p>
            </div>

            <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
              <div className='mb-2 text-gray-500'>
                <svg
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h4 className='mb-1 font-medium text-gray-900'>
                Active Quests
              </h4>
              <p className='text-2xl font-bold'>
                {isLoading ? '...' : '12'}
              </p>
            </div>

            <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
              <div className='mb-2 text-gray-500'>
                <svg
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M13 10V3L4 14h7v7l9-11h-7z'
                  />
                </svg>
              </div>
              <h4 className='mb-1 font-medium text-gray-900'>
                Weekly Steps
              </h4>
              <p className='text-2xl font-bold'>
                {isLoading ? '...' : '45.2K'}
              </p>
            </div>

            <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
              <div className='mb-2 text-gray-500'>
                <svg
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M13 10V3L4 14h7v7l9-11h-7z'
                  />
                </svg>
              </div>
              <h4 className='mb-1 font-medium text-gray-900'>
                Team Rank
              </h4>
              <p className='text-2xl font-bold'>
                {isLoading ? '...' : '#3'}
              </p>
            </div>
          </div>

          {/* Coming Soon Features */}
          <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
            <h3 className='text-lg font-semibold text-gray-900'>
              More Team Features Coming Soon
            </h3>
            <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                <div className='mb-2 text-secondary-600'>
                  <svg
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h4 className='mb-1 font-medium text-gray-900'>
                  Team Challenges
                </h4>
                <p className='text-sm text-gray-500'>
                  Compete in team quests and competitions
                </p>
              </div>

              <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                <div className='mb-2 text-secondary-600'>
                  <svg
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h2a6 6 0 016 6v1H3'
                    />
                  </svg>
                </div>
                <h4 className='mb-1 font-medium text-gray-900'>
                  Team Members
                </h4>
                <p className='text-sm text-gray-500'>
                  View team roster and member profiles
                </p>
              </div>

              <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                <div className='mb-2 text-success-600'>
                  <svg
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                </div>
                <h4 className='mb-1 font-medium text-gray-900'>
                  Team Stats
                </h4>
                <p className='text-sm text-gray-500'>
                  Collective performance metrics and insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
