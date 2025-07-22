'use client';

import { Target, Users, Plus, Heart, Zap } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { CardErrorBoundary } from '@/components/error/error-boundary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WidgetCard } from '@/components/ui/widget-card';
import { useAuth } from '@/hooks/use-auth';
import { useUserTeams } from '@/hooks/use-team-api';
import {
  useTeamChallenges,
  useTeamRecognitions,
} from '@/hooks/use-team-challenges-api';

interface TeamChallengesWidgetProps {
  userId: string;
}

export function TeamChallengesWidget({
  userId: _userId,
}: TeamChallengesWidgetProps) {
  const { user } = useAuth();

  // Get user's teams
  const {
    data: teamsResponse,
    isLoading: teamsLoading,
    error: teamsError,
  } = useUserTeams(user?.id || null);

  const teams = React.useMemo(
    () => teamsResponse?.data || [],
    [teamsResponse?.data]
  );

  // Get first team's data for preview
  const firstTeam = teams[0];

  const {
    data: teamChallengesResponse,
    isLoading: teamChallengesLoading,
    error: teamChallengesError,
  } = useTeamChallenges(firstTeam?.id || null);

  const {
    data: teamRecognitionsResponse,
    isLoading: teamRecognitionsLoading,
    error: teamRecognitionsError,
  } = useTeamRecognitions(firstTeam?.id || null);

  const isLoading =
    teamsLoading || teamChallengesLoading || teamRecognitionsLoading;
  const error = teamsError || teamChallengesError || teamRecognitionsError;

  const teamChallenges = teamChallengesResponse?.data || [];
  const teamRecognitions = teamRecognitionsResponse?.data || [];

  // Calculate stats
  const activeChallenges = teamChallenges.filter(c => c.isActive).length;
  const recentRecognitions = teamRecognitions.slice(0, 2);
  const totalRecognitions = teamRecognitions.length;

  const getRecognitionIcon = (type: string) => {
    switch (type) {
      case 'clap':
        return '👏';
      case 'fire':
        return '🔥';
      case 'heart':
        return '❤️';
      case 'flex':
        return '💪';
      case 'zap':
        return '⚡';
      case 'trophy':
        return '🏆';
      default:
        return '👏';
    }
  };

  const getRecognitionColor = (type: string) => {
    switch (type) {
      case 'clap':
        return 'bg-yellow-100 text-yellow-800';
      case 'fire':
        return 'bg-red-100 text-red-800';
      case 'heart':
        return 'bg-pink-100 text-pink-800';
      case 'flex':
        return 'bg-blue-100 text-blue-800';
      case 'zap':
        return 'bg-purple-100 text-purple-800';
      case 'trophy':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <WidgetCard title='Team Activities' className='animate-pulse'>
        <div className='space-y-3'>
          <div className='h-4 w-3/4 rounded bg-gray-200'></div>
          <div className='h-4 w-1/2 rounded bg-gray-200'></div>
          <div className='h-4 w-2/3 rounded bg-gray-200'></div>
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title='Team Activities' className='border-red-200 bg-red-50'>
        <div className='text-center text-red-600'>
          <p>Failed to load team activities</p>
        </div>
      </WidgetCard>
    );
  }

  if (!teams.length) {
    return (
      <WidgetCard
        title='Team Activities'
        className='border-gray-200 bg-gray-50'
      >
        <div className='text-center text-gray-600'>
          <Users className='mx-auto mb-2 h-8 w-8 text-gray-400' />
          <p className='text-sm'>
            Join a team to access challenges and recognition
          </p>
          <Link href='/team'>
            <Button variant='outline' size='sm' className='mt-2'>
              Find a Team
            </Button>
          </Link>
        </div>
      </WidgetCard>
    );
  }

  return (
    <CardErrorBoundary>
      <WidgetCard title='Team Activities'>
        <div className='max-h-[400px] space-y-4 overflow-y-auto'>
          {/* Social Stats Row */}
          <div className='grid grid-cols-2 gap-3'>
            {/* Active Challenges */}
            <div className='rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <Target className='h-4 w-4 text-blue-600' />
                  <span className='text-xs font-medium text-blue-800'>
                    Challenges
                  </span>
                </div>
                <Badge variant='secondary' className='text-xs'>
                  {activeChallenges}
                </Badge>
              </div>
              <div className='mt-1 text-xs text-blue-600'>
                {activeChallenges > 0 ? 'Active now' : 'No active challenges'}
              </div>
            </div>

            {/* Recognition Count */}
            <div className='rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 p-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <Heart className='h-4 w-4 text-pink-600' />
                  <span className='text-xs font-medium text-pink-800'>
                    Recognition
                  </span>
                </div>
                <Badge variant='secondary' className='text-xs'>
                  {totalRecognitions}
                </Badge>
              </div>
              <div className='mt-1 text-xs text-pink-600'>
                {totalRecognitions > 0 ? 'Given today' : 'No recognition yet'}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className='mb-3 flex items-center space-x-2'>
              <Zap className='h-4 w-4 text-orange-600' />
              <span className='text-sm font-medium'>Recent Activity</span>
            </div>

            {recentRecognitions.length > 0 ? (
              <div className='space-y-2'>
                {recentRecognitions.map(recognition => (
                  <div
                    key={recognition.id}
                    className='flex items-center justify-between rounded-lg bg-gray-50 p-2 transition-colors hover:bg-gray-100'
                  >
                    <div className='flex items-center space-x-2'>
                      <span
                        className={`rounded-full p-1 ${getRecognitionColor(recognition.type)}`}
                      >
                        {getRecognitionIcon(recognition.type)}
                      </span>
                      <span className='max-w-[120px] truncate text-xs text-gray-700'>
                        {recognition.message ||
                          `${recognition.type} recognition`}
                      </span>
                    </div>
                    <div className='flex space-x-1'>
                      <button className='text-xs text-gray-400 transition-colors hover:text-red-500'>
                        ❤️
                      </button>
                      <button className='text-xs text-gray-400 transition-colors hover:text-blue-500'>
                        👏
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='rounded-lg bg-gray-50 p-3 text-center'>
                <p className='text-xs text-gray-500'>No recent activity</p>
                <p className='mt-1 text-xs text-gray-400'>
                  Start engaging with your team!
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className='border-t pt-3'>
            <div className='grid grid-cols-2 gap-2'>
              <Link href='/team'>
                <Button variant='outline' size='sm' className='w-full'>
                  <Plus className='mr-1 h-3 w-3' />
                  Create
                </Button>
              </Link>
              <Link href='/team'>
                <Button variant='outline' size='sm' className='w-full'>
                  <Users className='mr-1 h-3 w-3' />
                  View All
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </WidgetCard>
    </CardErrorBoundary>
  );
}
