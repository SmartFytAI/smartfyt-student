'use client';

import { Trophy, Target, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { CardErrorBoundary } from '@/components/error/error-boundary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WidgetCard } from '@/components/ui/widget-card';
import { useAuth } from '@/hooks/use-auth';
import { useUserTeams } from '@/hooks/use-team-api';
import {
  useTeamQuests,
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
    data: teamQuestsResponse,
    isLoading: teamQuestsLoading,
    error: teamQuestsError,
  } = useTeamQuests(firstTeam?.id || null);

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
    teamsLoading ||
    teamQuestsLoading ||
    teamChallengesLoading ||
    teamRecognitionsLoading;
  const error =
    teamsError ||
    teamQuestsError ||
    teamChallengesError ||
    teamRecognitionsError;

  const teamQuests = teamQuestsResponse?.data || [];
  const teamChallenges = teamChallengesResponse?.data || [];
  const teamRecognitions = teamRecognitionsResponse?.data || [];

  // Calculate stats
  const activeQuests = teamQuests.filter(q => q.isActive).length;
  const activeChallenges = teamChallenges.filter(c => c.isActive).length;
  const recentRecognitions = teamRecognitions.slice(0, 3);

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
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'fire':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'heart':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      case 'flex':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'zap':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'trophy':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (error) {
    return (
      <CardErrorBoundary>
        <WidgetCard title='Team Challenges' className='h-[400px]'>
          <div className='flex h-full flex-col items-center justify-center text-center'>
            <div className='mb-4 text-4xl'>⚠️</div>
            <p className='mb-4 text-sm text-muted-foreground'>
              Failed to load team challenges
            </p>
            <Button variant='outline' size='sm' asChild>
              <Link href='/team-challenges'>View All</Link>
            </Button>
          </div>
        </WidgetCard>
      </CardErrorBoundary>
    );
  }

  if (isLoading) {
    return (
      <WidgetCard title='Team Challenges' className='h-[400px]'>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='text-center'>
              <div className='mx-auto mb-2 h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
              <div className='mx-auto h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
            </div>
            <div className='text-center'>
              <div className='mx-auto mb-2 h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
              <div className='mx-auto h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
            </div>
          </div>
          <div className='space-y-2'>
            <div className='h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
            <div className='h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
            <div className='h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
          </div>
        </div>
      </WidgetCard>
    );
  }

  if (teams.length === 0) {
    return (
      <WidgetCard title='Team Challenges' className='h-[400px]'>
        <div className='flex h-full flex-col items-center justify-center text-center'>
          <Users className='mb-4 h-12 w-12 text-gray-400' />
          <h4 className='mb-2 text-sm font-medium'>No Teams Found</h4>
          <p className='mb-4 text-xs text-muted-foreground'>
            Join a team to access challenges and quests
          </p>
          <Button variant='outline' size='sm' asChild>
            <Link href='/team'>View Teams</Link>
          </Button>
        </div>
      </WidgetCard>
    );
  }

  return (
    <CardErrorBoundary>
      <WidgetCard title='Team Challenges' className='h-[400px]'>
        <div className='space-y-4'>
          {/* Stats Overview */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='text-center'>
              <div className='mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20'>
                <Target className='h-4 w-4 text-primary-600' />
              </div>
              <div className='text-lg font-bold'>{activeQuests}</div>
              <div className='text-xs text-muted-foreground'>Active Quests</div>
            </div>
            <div className='text-center'>
              <div className='mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-900/20'>
                <Users className='h-4 w-4 text-secondary-600' />
              </div>
              <div className='text-lg font-bold'>{activeChallenges}</div>
              <div className='text-xs text-muted-foreground'>Challenges</div>
            </div>
          </div>

          {/* Recent Recognitions */}
          <div>
            <h4 className='mb-2 text-sm font-medium'>Recent Recognition</h4>
            {recentRecognitions.length === 0 ? (
              <p className='text-xs text-muted-foreground'>
                No recent recognitions
              </p>
            ) : (
              <div className='space-y-2'>
                {recentRecognitions.map(recognition => (
                  <div key={recognition.id} className='flex items-center gap-2'>
                    <span className='text-sm'>
                      {getRecognitionIcon(recognition.type)}
                    </span>
                    <Badge className={getRecognitionColor(recognition.type)}>
                      {recognition.type}
                    </Badge>
                    <span className='flex-1 truncate text-xs text-muted-foreground'>
                      {recognition.message || 'Great job!'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className='space-y-2'>
            <Button size='sm' className='w-full' asChild>
              <Link href='/team-challenges'>
                <Trophy className='mr-2 h-4 w-4' />
                View All Challenges
              </Link>
            </Button>
            <Button variant='outline' size='sm' className='w-full' asChild>
              <Link href='/team-challenges?tab=create'>
                <Plus className='mr-2 h-4 w-4' />
                Create New
              </Link>
            </Button>
          </div>
        </div>
      </WidgetCard>
    </CardErrorBoundary>
  );
}
