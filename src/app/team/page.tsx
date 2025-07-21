'use client';

import { Users, Target, Activity, TrendingUp } from 'lucide-react';

import { PageLayout } from '@/components/layout/page-layout';
import { TeamLeaderboard } from '@/components/team/team-leaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useUserTeams } from '@/hooks/use-team-api';
import { logger } from '@/lib/logger';

export default function TeamPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    data: teamsResponse,
    isLoading: teamsLoading,
    error: teamsError,
  } = useUserTeams(user?.id || null);
  const teams = teamsResponse?.data || [];
  const isLoading = authLoading || teamsLoading;
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
      authLoading,
      teamsLoading,
      teamsError: teamsError?.message,
      teamsResponse: teamsResponse,
    });
  }

  return (
    <PageLayout
      title='Team'
      subtitle='Connect with your teammates and compete together'
    >
      <div className='mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8'>
        {/* Team Leaderboard */}
        <TeamLeaderboard userId={user?.id || ''} teams={teams} />

        {/* Show error state */}
        {error && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2 text-danger-600'>
                <span>Error Loading Teams</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='py-4 text-center'>
                <p className='mb-2 text-danger-500'>{error}</p>
                <p className='text-sm text-gray-500'>
                  Please try refreshing the page or contact support if the
                  problem persists.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show message when user has no teams */}
        {!isLoading && !error && teams.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Users className='h-5 w-5 text-secondary-500' />
                <span>No Teams Found</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='py-8 text-center'>
                <p className='mb-2 text-gray-600'>
                  You&apos;re not currently part of any teams.
                </p>
                <p className='mb-4 text-sm text-gray-500'>
                  Teams will appear here once you&apos;re added by your coach or
                  administrator.
                </p>
                <div className='text-xs text-gray-400'>
                  <p>User ID: {user?.id || 'Not available'}</p>
                  <p>Email: {user?.email || 'Not available'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Overview Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-gray-500'>
                Total Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center space-x-2'>
                <Users className='h-5 w-5 text-secondary-500' />
                <span className='text-2xl font-bold'>
                  {isLoading ? '...' : teams.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-gray-500'>
                Active Quests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center space-x-2'>
                <Target className='h-5 w-5 text-success-500' />
                <span className='text-2xl font-bold'>
                  {isLoading ? '...' : '12'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-gray-500'>
                Weekly Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center space-x-2'>
                <Activity className='h-5 w-5 text-primary-500' />
                <span className='text-2xl font-bold'>
                  {isLoading ? '...' : '45.2K'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-gray-500'>
                Team Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center space-x-2'>
                <TrendingUp className='h-5 w-5 text-primary-500' />
                <span className='text-2xl font-bold'>
                  {isLoading ? '...' : '#3'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Features */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg font-semibold'>
              More Team Features Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                <div className='mb-2 text-primary-600'>
                  <Target className='h-6 w-6' />
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
                  <Users className='h-6 w-6' />
                </div>
                <h4 className='mb-1 font-medium text-gray-900'>Team Members</h4>
                <p className='text-sm text-gray-500'>
                  View team roster and member profiles
                </p>
              </div>

              <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                <div className='mb-2 text-success-600'>
                  <Activity className='h-6 w-6' />
                </div>
                <h4 className='mb-1 font-medium text-gray-900'>Team Stats</h4>
                <p className='text-sm text-gray-500'>
                  Collective performance metrics and insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
