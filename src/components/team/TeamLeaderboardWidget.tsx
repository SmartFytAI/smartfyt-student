'use client';

import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';
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

export function TeamLeaderboardWidget({
  userId,
  teams,
}: TeamLeaderboardWidgetProps) {
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState<
    Record<string, LeaderboardEntry[]>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch real leaderboard data for a team
  const fetchTeamLeaderboard = async (
    teamId: string
  ): Promise<LeaderboardEntry[]> => {
    try {
      logger.debug('Fetching team leaderboard', { teamId });
      const response = await apiClient.getTeamLeaderboard(teamId);

      if (response.error) {
        throw new Error(response.error);
      }

      // Transform API response to our format
      const leaderboardEntries: LeaderboardEntry[] = (response.data || []).map(
        (entry: Record<string, unknown>, index: number) => ({
          userId: String(entry.id || ''),
          firstName: String(entry.firstName || ''),
          lastName: String(entry.lastName || ''),
          profileImage: entry.profileImage
            ? String(entry.profileImage)
            : undefined,
          weeklySteps: Number(entry.weeklySteps) || 0,
          engagementScore: Number(entry.performanceScore) || 0,
          rank: index + 1,
          badge:
            index === 0
              ? '🥇'
              : index === 1
                ? '🥈'
                : index === 2
                  ? '🥉'
                  : undefined,
        })
      );

      logger.debug('Team leaderboard fetched successfully', {
        teamId,
        entryCount: leaderboardEntries.length,
      });

      return leaderboardEntries;
    } catch (error) {
      logger.error('Failed to fetch team leaderboard', { teamId, error });
      throw error;
    }
  };

  // Generate mock leaderboard data based on actual teams
  const generateMockLeaderboardData = useCallback(
    (teams: Team[]): Record<string, LeaderboardEntry[]> => {
      const data: Record<string, LeaderboardEntry[]> = {};

      teams.forEach((team, teamIndex) => {
        const teamMembers = [
          {
            userId: 'user-1',
            firstName: 'Alex',
            lastName: 'Johnson',
            weeklySteps: 12500 + teamIndex * 500,
            engagementScore: 850 + teamIndex * 20,
            rank: 1,
            badge: '🥇',
          },
          {
            userId: 'user-2',
            firstName: 'Sarah',
            lastName: 'Williams',
            weeklySteps: 11800 + teamIndex * 400,
            engagementScore: 820 + teamIndex * 15,
            rank: 2,
            badge: '🥈',
          },
          {
            userId: 'user-3',
            firstName: 'Mike',
            lastName: 'Davis',
            weeklySteps: 11200 + teamIndex * 300,
            engagementScore: 790 + teamIndex * 10,
            rank: 3,
            badge: '🥉',
          },
          {
            userId: userId,
            firstName: 'You',
            lastName: '',
            weeklySteps: 9800 + teamIndex * 200,
            engagementScore: 720 + teamIndex * 5,
            rank: 4,
          },
          {
            userId: 'user-4',
            firstName: 'Jordan',
            lastName: 'Smith',
            weeklySteps: 10500 + teamIndex * 250,
            engagementScore: 750 + teamIndex * 8,
            rank: 5,
          },
        ];

        data[team.id] = teamMembers;
      });

      return data;
    },
    [userId]
  );

  // Load leaderboard data when teams change
  useEffect(() => {
    const loadLeaderboardData = async () => {
      if (teams.length === 0) return;

      setIsLoading(true);
      setError(null);

      try {
        const newLeaderboardData: Record<string, LeaderboardEntry[]> = {};

        // Load data for all teams
        for (const team of teams) {
          try {
            const teamData = await fetchTeamLeaderboard(team.id);
            newLeaderboardData[team.id] = teamData;
          } catch (error) {
            logger.warn(
              'Failed to load leaderboard for team, using mock data',
              {
                teamId: team.id,
                teamName: team.name,
                error,
              }
            );
            // Fallback to mock data if API fails
            newLeaderboardData[team.id] =
              generateMockLeaderboardData([team])[team.id] || [];
          }
        }

        setLeaderboardData(newLeaderboardData);
        logger.info('Leaderboard data loaded for all teams', {
          teamCount: teams.length,
          teams: teams.map(t => ({ id: t.id, name: t.name })),
        });
      } catch (error) {
        logger.error('Failed to load leaderboard data', { error });
        setError('Failed to load leaderboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboardData();
  }, [teams, generateMockLeaderboardData]);

  const currentTeam = teams[currentTeamIndex];
  const currentLeaderboard = leaderboardData[currentTeam?.id] || [];

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
          <Trophy className='h-4 w-4 text-orange-500' />
          <h4 className='text-sm font-medium dark:text-white'>
            {currentTeam?.name}
          </h4>
        </div>

        {teams.length > 1 && (
          <div className='flex items-center space-x-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={prevTeam}
              className='h-6 w-6 p-0'
            >
              <ChevronLeft className='h-3 w-3' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={nextTeam}
              className='h-6 w-6 p-0'
            >
              <ChevronRight className='h-3 w-3' />
            </Button>
          </div>
        )}
      </div>

      {/* Swipeable Leaderboard with Fixed Height */}
      <div
        ref={containerRef}
        className='relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700'
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className='max-h-64 space-y-2 overflow-y-auto p-3'>
          {isLoading ? (
            // Loading state
            <div className='space-y-2'>
              {[...Array(5)].map((_, skeletonIndex) => (
                <div
                  key={skeletonIndex}
                  className='flex animate-pulse items-center space-x-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-800'
                >
                  <div className='h-6 w-6 rounded bg-gray-200 dark:bg-gray-700'></div>
                  <div className='h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700'></div>
                  <div className='flex-1 space-y-1'>
                    <div className='h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700'></div>
                    <div className='h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700'></div>
                  </div>
                  <div className='h-4 w-12 rounded bg-gray-200 dark:bg-gray-700'></div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className='py-4 text-center'>
              <p className='text-sm text-red-500 dark:text-red-400'>{error}</p>
            </div>
          ) : currentLeaderboard.length === 0 ? (
            // Empty state
            <div className='py-4 text-center'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                No leaderboard data available
              </p>
            </div>
          ) : (
            // Leaderboard entries
            currentLeaderboard.map(entry => (
              <div
                key={entry.userId}
                className={`flex items-center space-x-3 rounded-lg p-2 transition-colors ${
                  entry.userId === userId
                    ? 'border border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20'
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className='flex w-6 items-center justify-center'>
                  <span className='text-sm font-bold text-gray-500'>
                    {entry.badge || entry.rank}
                  </span>
                </div>

                <Avatar className='h-8 w-8'>
                  <AvatarImage src={entry.profileImage} />
                  <AvatarFallback className='text-xs'>
                    {entry.firstName[0]}
                    {entry.lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium dark:text-gray-200'>
                    {entry.firstName} {entry.lastName}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    {entry.weeklySteps.toLocaleString()} steps
                  </p>
                </div>

                <div className='text-right'>
                  <p className='text-sm font-bold text-orange-600 dark:text-orange-400'>
                    {entry.engagementScore}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    pts
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dots Navigation */}
      {teams.length > 1 && (
        <div className='flex justify-center space-x-2'>
          {teams.map((_, teamIndex) => (
            <button
              key={teamIndex}
              onClick={() => goToTeam(teamIndex)}
              className={`h-2 w-2 rounded-full transition-colors ${
                teamIndex === currentTeamIndex
                  ? 'bg-orange-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label={`Go to team ${teamIndex + 1}`}
            />
          ))}
        </div>
      )}

      {/* Team Label */}
      {teams.length > 1 && (
        <div className='text-center'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            {currentTeamIndex + 1} of {teams.length} teams
          </p>
        </div>
      )}
    </div>
  );
}
