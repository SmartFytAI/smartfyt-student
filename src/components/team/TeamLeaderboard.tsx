'use client';

import { Heart, Minus, Trophy, TrendingDown, TrendingUp } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry, Team } from '@/types';

interface TeamLeaderboardProps {
  userId: string;
  teams: Team[];
}

export function TeamLeaderboard({ userId, teams }: TeamLeaderboardProps) {
  const [activeTab, setActiveTab] = useState('team');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set first team as default if available
  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  const fetchLeaderboardData = useCallback(async () => {
    if (!selectedTeamId) return;

    setIsLoading(true);
    setError(null);

    try {
      let response;

      if (activeTab === 'team') {
        response = await apiClient.getTeamLeaderboard(selectedTeamId);
      } else {
        response = await apiClient.getSchoolLeaderboard(userId);
      }

      if (response.error) {
        throw new Error(response.error);
      }

      const data = response.data || [];

      // Transform API response to LeaderboardEntry format
      const leaderboardEntries: LeaderboardEntry[] = data.map(
        (entry: any, index: number) => ({
          userId: entry.id,
          firstName: entry.firstName,
          lastName: entry.lastName,
          profileImage: entry.profileImage,
          engagementScore: entry.performanceScore || 0,
          weeklySteps: 0, // Will be populated from activity data
          questsCompleted: 0, // Will be populated from quest data
          journalsCount: 0, // Will be populated from journal data
          rank: index + 1,
          trend: entry.trend || 'none',
          claps: 0,
          isCurrentUser: entry.id === userId,
        })
      );

      setLeaderboardData(leaderboardEntries);
      logger.info('Leaderboard data fetched successfully', {
        teamId: selectedTeamId,
        entryCount: leaderboardEntries.length,
      });
    } catch (error) {
      logger.error('Failed to fetch leaderboard data', { error });
      setError('Failed to load leaderboard data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTeamId, activeTab, userId]);

  // Fetch leaderboard data when team changes
  useEffect(() => {
    if (selectedTeamId) {
      fetchLeaderboardData();
    }
  }, [selectedTeamId, activeTab, fetchLeaderboardData]);

  const handleClap = async (entry: LeaderboardEntry) => {
    try {
      // TODO: Implement clap API endpoint
      logger.info('Clap action triggered', {
        targetUserId: entry.userId,
        currentUserId: userId,
      });

      // For now, just log the action
      // In the future, this will call an API to record the clap
    } catch (error) {
      logger.error('Failed to send clap', { error });
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'none') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className='h-4 w-4 text-green-500' />;
      case 'down':
        return <TrendingDown className='h-4 w-4 text-red-500' />;
      default:
        return <Minus className='h-4 w-4 text-gray-400' />;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className='text-2xl'>🥇</span>;
      case 2:
        return <span className='text-2xl'>🥈</span>;
      case 3:
        return <span className='text-2xl'>🥉</span>;
      default:
        return <span className='text-lg font-bold text-gray-500'>#{rank}</span>;
    }
  };

  const LeaderboardItem = ({ entry }: { entry: LeaderboardEntry }) => (
    <div
      className={cn(
        'flex items-center rounded-lg p-4 transition-all duration-200',
        entry.isCurrentUser
          ? 'border-2 border-blue-200 bg-blue-50'
          : 'border border-gray-100 bg-white hover:bg-gray-50'
      )}
    >
      {/* Rank */}
      <div className='flex w-12 items-center justify-center'>
        {getRankBadge(entry.rank)}
      </div>

      {/* Avatar and Name */}
      <div className='flex min-w-0 flex-1 items-center space-x-3'>
        <Avatar className='h-10 w-10'>
          <AvatarImage
            src={entry.profileImage || ''}
            alt={`${entry.firstName} ${entry.lastName}`}
          />
          <AvatarFallback className='bg-gray-100 text-gray-600'>
            {entry.firstName[0]}
            {entry.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-medium'>
            {entry.firstName} {entry.lastName}
            {entry.isCurrentUser && (
              <Badge variant='secondary' className='ml-2 text-xs'>
                You
              </Badge>
            )}
          </p>
          <p className='truncate text-xs text-gray-500'>
            {entry.weeklySteps.toLocaleString()} steps • {entry.questsCompleted}{' '}
            quests
          </p>
        </div>
      </div>

      {/* Score and Trend */}
      <div className='flex items-center space-x-2'>
        <div className='text-right'>
          <p className='text-lg font-bold'>{entry.engagementScore}</p>
          <p className='text-xs text-gray-500'>points</p>
        </div>
        {getTrendIcon(entry.trend)}
      </div>

      {/* Clap Button */}
      <Button
        variant='ghost'
        size='sm'
        onClick={() => handleClap(entry)}
        className='ml-2 hover:bg-orange-50 hover:text-orange-600'
        disabled={entry.isCurrentUser}
      >
        <Heart className='h-4 w-4' />
        <span className='ml-1 text-xs'>{entry.claps}</span>
      </Button>
    </div>
  );

  if (teams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Trophy className='h-5 w-5 text-orange-500' />
            <span>Team Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='py-8 text-center'>
            <p className='text-gray-500'>
              You&apos;re not part of any teams yet.
            </p>
            <p className='mt-1 text-sm text-gray-400'>
              Join a team to see the leaderboard!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center space-x-2'>
            <Trophy className='h-5 w-5 text-orange-500' />
            <span>Team Leaderboard</span>
          </CardTitle>
          {teams.length > 1 && (
            <select
              value={selectedTeamId}
              onChange={e => setSelectedTeamId(e.target.value)}
              className='rounded-md border border-gray-200 bg-white px-3 py-1 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-4'
        >
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='team'>
              <span>Team</span>
            </TabsTrigger>
            <TabsTrigger value='school'>
              <span>School</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='team' className='space-y-3'>
            {isLoading ? (
              <div className='space-y-3'>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className='flex animate-pulse items-center rounded-lg bg-gray-100 p-4'
                  >
                    <div className='h-8 w-12 rounded bg-gray-200'></div>
                    <div className='ml-4 flex flex-1 items-center space-x-3'>
                      <div className='h-10 w-10 rounded-full bg-gray-200'></div>
                      <div className='flex-1 space-y-2'>
                        <div className='h-4 w-24 rounded bg-gray-200'></div>
                        <div className='h-3 w-32 rounded bg-gray-200'></div>
                      </div>
                    </div>
                    <div className='h-6 w-16 rounded bg-gray-200'></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className='py-8 text-center'>
                <p className='text-red-500'>{error}</p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={fetchLeaderboardData}
                  className='mt-2'
                >
                  Try Again
                </Button>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className='py-8 text-center'>
                <p className='text-gray-500'>No leaderboard data available.</p>
              </div>
            ) : (
              <div className='space-y-2'>
                {leaderboardData.map(entry => (
                  <LeaderboardItem key={entry.userId} entry={entry} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value='school' className='space-y-3'>
            {isLoading ? (
              <div className='space-y-3'>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className='flex animate-pulse items-center rounded-lg bg-gray-100 p-4'
                  >
                    <div className='h-8 w-12 rounded bg-gray-200'></div>
                    <div className='ml-4 flex flex-1 items-center space-x-3'>
                      <div className='h-10 w-10 rounded-full bg-gray-200'></div>
                      <div className='flex-1 space-y-2'>
                        <div className='h-4 w-24 rounded bg-gray-200'></div>
                        <div className='h-3 w-32 rounded bg-gray-200'></div>
                      </div>
                    </div>
                    <div className='h-6 w-16 rounded bg-gray-200'></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className='py-8 text-center'>
                <p className='text-red-500'>{error}</p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={fetchLeaderboardData}
                  className='mt-2'
                >
                  Try Again
                </Button>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className='py-8 text-center'>
                <p className='text-gray-500'>
                  No school leaderboard data available.
                </p>
              </div>
            ) : (
              <div className='space-y-2'>
                {leaderboardData.map(entry => (
                  <LeaderboardItem key={entry.userId} entry={entry} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
