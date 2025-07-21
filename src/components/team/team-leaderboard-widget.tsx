'use client';

import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { CardErrorBoundary } from '@/components/error/error-boundary';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTeamLeaderboard } from '@/hooks/use-team-api';
import type { Team } from '@/types';

interface TeamLeaderboardWidgetProps {
  userId: string;
  teams: Team[];
}

interface LeaderboardEntry {
  userId: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  weeklySteps: number;
  engagementScore: number;
  rank: number;
  badge?: string;
}

function TeamLeaderboardWidgetContent({
  userId,
  teams,
}: TeamLeaderboardWidgetProps) {
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);

  // Set first team as default if available
  useEffect(() => {
    if (teams.length > 0 && currentTeamIndex >= teams.length) {
      setCurrentTeamIndex(0);
    }
  }, [teams, currentTeamIndex]);

  // Use our service layer for team leaderboard
  const {
    data: leaderboardResponse,
    isLoading,
    error,
  } = useTeamLeaderboard(teams[currentTeamIndex]?.id || null);

  // Transform leaderboard data to our format
  const leaderboardEntries: LeaderboardEntry[] = React.useMemo(() => {
    if (!leaderboardResponse?.data?.entries) return [];

    return leaderboardResponse.data.entries.map((entry, index) => ({
      userId: entry.userId,
      firstName: entry.firstName,
      lastName: entry.lastName,
      profileImage: entry.profileImage || undefined,
      weeklySteps: entry.weeklySteps,
      engagementScore: entry.engagementScore,
      rank: index + 1,
      badge:
        index === 0
          ? '🥇'
          : index === 1
            ? '🥈'
            : index === 2
              ? '🥉'
              : undefined,
    }));
  }, [leaderboardResponse?.data?.entries]);

  const currentTeam = teams[currentTeamIndex];

  const nextTeam = () => {
    setCurrentTeamIndex(prev => (prev + 1) % teams.length);
  };

  const prevTeam = () => {
    setCurrentTeamIndex(prev => (prev - 1 + teams.length) % teams.length);
  };

  const goToTeam = (index: number) => {
    setCurrentTeamIndex(index);
  };

  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextTeam();
    } else if (isRightSwipe) {
      prevTeam();
    }
  };

  if (teams.length === 0) {
    return (
      <div className='py-6 text-center'>
        <div className='mb-2 text-4xl'>🏆</div>
        <p className='text-sm font-medium dark:text-gray-300'>No Teams Yet</p>
        <p className='text-xs text-gray-500 dark:text-gray-400'>
          Join a team to see the leaderboard
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Team Header with Navigation */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <Trophy className='h-5 w-5 text-yellow-500' />
          <h3 className='font-semibold dark:text-white'>
            {currentTeam?.name || 'Team Leaderboard'}
          </h3>
        </div>

        {teams.length > 1 && (
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='sm'
              onClick={prevTeam}
              className='h-8 w-8 p-0'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={nextTeam}
              className='h-8 w-8 p-0'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        )}
      </div>

      {/* Leaderboard Content */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className='space-y-3'
      >
        {isLoading ? (
          <div className='py-6 text-center'>
            <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600'></div>
            <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
              Loading leaderboard...
            </p>
          </div>
        ) : error ? (
          <div className='py-6 text-center'>
            <div className='mb-2 text-4xl'>⚠️</div>
            <p className='text-sm font-medium text-red-600 dark:text-red-400'>
              Failed to load leaderboard
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Please try again later
            </p>
          </div>
        ) : leaderboardEntries.length === 0 ? (
          <div className='py-6 text-center'>
            <div className='mb-2 text-4xl'>📊</div>
            <p className='text-sm font-medium dark:text-gray-300'>
              No leaderboard data
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Check back later for updates
            </p>
          </div>
        ) : (
          <div className='space-y-2'>
            {leaderboardEntries.slice(0, 5).map(entry => (
              <div
                key={entry.userId}
                className='flex items-center space-x-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800'
              >
                <div className='flex items-center space-x-2'>
                  <span className='text-lg font-bold text-gray-500'>
                    {entry.badge || entry.rank}
                  </span>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={entry.profileImage} />
                    <AvatarFallback>
                      {entry.firstName[0]}
                      {entry.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium dark:text-white'>
                    {entry.firstName} {entry.lastName}
                    {entry.userId === userId && (
                      <span className='ml-2 text-xs text-primary-600 dark:text-primary-400'>
                        (You)
                      </span>
                    )}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    {entry.weeklySteps.toLocaleString()} steps
                  </p>
                </div>

                <div className='text-right'>
                  <p className='text-sm font-semibold text-primary-600 dark:text-primary-400'>
                    {entry.engagementScore}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    points
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Navigation Dots - Bottom */}
      {teams.length > 1 && (
        <div className='flex justify-center space-x-2 pt-2'>
          {teams.map((team, index) => (
            <button
              key={team.id}
              onClick={() => goToTeam(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentTeamIndex
                  ? 'bg-primary-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label={`Go to ${team.name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TeamLeaderboardWidget({
  userId,
  teams,
}: TeamLeaderboardWidgetProps) {
  return (
    <CardErrorBoundary>
      <TeamLeaderboardWidgetContent userId={userId} teams={teams} />
    </CardErrorBoundary>
  );
}
