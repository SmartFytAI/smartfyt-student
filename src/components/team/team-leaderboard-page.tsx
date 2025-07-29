'use client';

import { Trophy, Users, ChevronUp, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeamLeaderboard } from '@/hooks/use-team-api';
import type { Team } from '@/types';

interface TeamLeaderboardPageProps {
  userId: string;
  selectedTeamId: string | null;
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

export function TeamLeaderboardPage({
  userId,
  selectedTeamId,
  teams,
}: TeamLeaderboardPageProps) {
  const [sortBy, setSortBy] = useState<'rank' | 'steps' | 'engagement'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Find the selected team
  const selectedTeam = teams.find(team => team.id === selectedTeamId);

  // Use our service layer for team leaderboard
  const {
    data: leaderboardResponse,
    isLoading,
    error,
  } = useTeamLeaderboard(selectedTeamId);

  // Transform leaderboard data to our format
  const leaderboardEntries: LeaderboardEntry[] = React.useMemo(() => {
    if (!leaderboardResponse?.data?.entries) return [];

    const entries = leaderboardResponse.data.entries.map((entry, index) => ({
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

    // Sort entries based on current sort settings
    const sortedEntries = [...entries].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case 'steps':
          aValue = a.weeklySteps;
          bValue = b.weeklySteps;
          break;
        case 'engagement':
          aValue = a.engagementScore;
          bValue = b.engagementScore;
          break;
        case 'rank':
        default:
          aValue = a.rank;
          bValue = b.rank;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return sortedEntries;
  }, [leaderboardResponse?.data?.entries, sortBy, sortOrder]);

  const handleSort = (newSortBy: 'rank' | 'steps' | 'engagement') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc'); // Default to descending for steps and engagement
    }
  };

  const getSortIcon = (column: 'rank' | 'steps' | 'engagement') => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className='h-3 w-3' />
    ) : (
      <ChevronDown className='h-3 w-3' />
    );
  };

  if (!selectedTeam) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='h-5 w-5' />
            Team Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='py-6 text-center'>
            <div className='mb-2 text-4xl'>🏆</div>
            <p className='text-sm font-medium'>
              Select a team to view leaderboard
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Trophy className='h-5 w-5 text-primary-600' />
          {selectedTeam.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='leaderboard' className='space-y-4'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger
              value='leaderboard'
              className='flex items-center gap-2'
            >
              <Trophy className='h-4 w-4' />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value='members' className='flex items-center gap-2'>
              <Users className='h-4 w-4' />
              All Members
            </TabsTrigger>
          </TabsList>

          {/* Leaderboard Tab */}
          <TabsContent value='leaderboard' className='space-y-4'>
            {isLoading ? (
              <div className='space-y-3'>
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className='flex items-center space-x-3 rounded-lg bg-gray-50 p-3'
                  >
                    <div className='h-8 w-8 animate-pulse rounded-full bg-gray-200'></div>
                    <div className='flex-1 space-y-2'>
                      <div className='h-4 w-24 animate-pulse rounded bg-gray-200'></div>
                      <div className='h-3 w-16 animate-pulse rounded bg-gray-200'></div>
                    </div>
                    <div className='h-6 w-8 animate-pulse rounded bg-gray-200'></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className='py-6 text-center'>
                <div className='mb-2 text-4xl'>⚠️</div>
                <p className='text-sm font-medium text-red-600'>
                  Failed to load leaderboard
                </p>
                <p className='text-xs text-gray-500'>Please try again later</p>
              </div>
            ) : leaderboardEntries.length === 0 ? (
              <div className='py-6 text-center'>
                <div className='mb-2 text-4xl'>📊</div>
                <p className='text-sm font-medium'>No leaderboard data</p>
                <p className='text-xs text-gray-500'>
                  Check back later for updates
                </p>
              </div>
            ) : (
              <>
                {/* Sort Controls */}
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleSort('rank')}
                    className='flex items-center gap-1'
                  >
                    Rank {getSortIcon('rank')}
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleSort('steps')}
                    className='flex items-center gap-1'
                  >
                    Steps {getSortIcon('steps')}
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleSort('engagement')}
                    className='flex items-center gap-1'
                  >
                    Points {getSortIcon('engagement')}
                  </Button>
                </div>

                {/* Leaderboard Entries */}
                <div className='space-y-2'>
                  {leaderboardEntries.map(entry => (
                    <div
                      key={entry.userId}
                      className='flex items-center space-x-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100'
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
                        <p className='truncate text-sm font-medium'>
                          {entry.firstName} {entry.lastName}
                          {entry.userId === userId && (
                            <Badge variant='secondary' className='ml-2'>
                              You
                            </Badge>
                          )}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {entry.weeklySteps.toLocaleString()} steps
                        </p>
                      </div>

                      <div className='text-right'>
                        <p className='text-sm font-semibold text-primary-600'>
                          {Math.round(entry.engagementScore)}
                        </p>
                        <p className='text-xs text-gray-500'>points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value='members' className='space-y-4'>
            {isLoading ? (
              <div className='space-y-3'>
                {Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className='flex items-center space-x-3 rounded-lg bg-gray-50 p-3'
                  >
                    <div className='h-8 w-8 animate-pulse rounded-full bg-gray-200'></div>
                    <div className='flex-1 space-y-2'>
                      <div className='h-4 w-24 animate-pulse rounded bg-gray-200'></div>
                      <div className='h-3 w-16 animate-pulse rounded bg-gray-200'></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className='py-6 text-center'>
                <div className='mb-2 text-4xl'>⚠️</div>
                <p className='text-sm font-medium text-red-600'>
                  Failed to load members
                </p>
                <p className='text-xs text-gray-500'>Please try again later</p>
              </div>
            ) : leaderboardEntries.length === 0 ? (
              <div className='py-6 text-center'>
                <div className='mb-2 text-4xl'>👥</div>
                <p className='text-sm font-medium'>No team members found</p>
                <p className='text-xs text-gray-500'>
                  Check back later for updates
                </p>
              </div>
            ) : (
              <div className='space-y-2'>
                {leaderboardEntries.map(entry => (
                  <div
                    key={entry.userId}
                    className='flex items-center space-x-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100'
                  >
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={entry.profileImage} />
                      <AvatarFallback>
                        {entry.firstName[0]}
                        {entry.lastName[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>
                        {entry.firstName} {entry.lastName}
                        {entry.userId === userId && (
                          <Badge variant='secondary' className='ml-2'>
                            You
                          </Badge>
                        )}
                      </p>
                      <p className='text-xs text-gray-500'>
                        Member since {new Date().getFullYear()}
                      </p>
                    </div>

                    <div className='text-right'>
                      <p className='text-xs text-gray-500'>
                        {entry.weeklySteps.toLocaleString()} steps
                      </p>
                      <p className='text-xs text-gray-500'>
                        {Math.round(entry.engagementScore)} pts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
