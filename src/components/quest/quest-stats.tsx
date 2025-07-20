'use client';

import { useEffect, useState } from 'react';

import { logger } from '@/lib/logger';
import { QuestService } from '@/lib/services/quest-service';
import { UserStat } from '@/types';

interface QuestStatsProps {
  userId: string;
}

export function QuestStats({ userId }: QuestStatsProps) {
  const [stats, setStats] = useState<UserStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      logger.debug('📊 Fetching quest stats for user:', { userId });
      
      const userStats = await QuestService.getUserStats(userId);
      setStats(userStats);
      
      logger.debug('✅ Quest stats fetched successfully:', {
        count: userStats.length,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      logger.error('❌ Error fetching quest stats:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'strength':
        return '💪';
      case 'endurance':
        return '⏱️';
      case 'grit':
        return '🔥';
      case 'accountability':
        return '✅';
      case 'speed':
        return '⚡';
      case 'agility':
        return '🏃';
      case 'confidence':
        return '🏆';
      case 'leadership':
        return '👥';
      case 'time management':
        return '⏰';
      case 'communication':
        return '💬';
      case 'networking ability':
        return '🌐';
      case 'mindfulness & well-being':
        return '🧘';
      default:
        return '⚔️';
    }
  };

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'strength':
        return 'bg-red-500';
      case 'endurance':
        return 'bg-blue-500';
      case 'grit':
        return 'bg-amber-500';
      case 'accountability':
        return 'bg-green-500';
      case 'speed':
        return 'bg-purple-500';
      case 'agility':
        return 'bg-pink-500';
      case 'confidence':
        return 'bg-yellow-500';
      case 'leadership':
        return 'bg-indigo-500';
      case 'time management':
        return 'bg-cyan-500';
      case 'communication':
        return 'bg-emerald-500';
      case 'networking ability':
        return 'bg-violet-500';
      case 'mindfulness & well-being':
        return 'bg-rose-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 10) return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
    if (level >= 7) return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    if (level >= 4) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
  };

  const getPointsForNextLevel = (level: number) => level * 100;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-4 text-sm text-gray-600 dark:text-gray-400'>
            Loading your stats...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20'>
        <div className='flex items-center'>
          <div className='flex-shrink-0'>
            <span className='text-2xl'>❌</span>
          </div>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-red-800 dark:text-red-200'>
              Error loading stats
            </h3>
            <p className='mt-1 text-sm text-red-700 dark:text-red-300'>{error}</p>
            <button
              onClick={fetchStats}
              className='mt-3 rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700'
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalPoints = stats.reduce((sum, stat) => sum + stat.points, 0);
  const totalLevel = Math.floor(totalPoints / 100) + 1;
  const sortedStats = [...stats].sort((a, b) => b.points - a.points);

  return (
    <div className='space-y-6'>
      {/* Overall Stats */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
          Overall Progress
        </h3>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
              {totalPoints}
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-400'>Total Points</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
              {totalLevel}
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-400'>Overall Level</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
              {stats.filter(stat => stat.points > 0).length}
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-400'>Active Categories</div>
          </div>
        </div>
      </div>

      {/* Category Stats */}
      <div className='rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'>
        <div className='border-b border-gray-200 px-6 py-4 dark:border-gray-700'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Category Progress
          </h3>
        </div>
        <div className='divide-y divide-gray-200 dark:divide-gray-700'>
          {sortedStats.map((stat) => {
            const pointsForNext = getPointsForNextLevel(stat.level);
            const progress = stat.points % 100;
            const progressPercentage = (progress / 100) * 100;

            return (
              <div key={stat.id} className='p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getCategoryColor(stat.categoryName)}`}>
                      <span className='text-lg'>{getCategoryIcon(stat.categoryName)}</span>
                    </div>
                    <div>
                      <h4 className='font-medium text-gray-900 dark:text-white'>
                        {stat.categoryName}
                      </h4>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        {stat.points} points • Level {stat.level}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getLevelColor(stat.level)}`}>
                      Level {stat.level}
                    </span>
                  </div>
                </div>
                
                <div className='mt-4'>
                  <div className='flex justify-between text-sm text-gray-600 dark:text-gray-400'>
                    <span>Progress to Level {stat.level + 1}</span>
                    <span>{progress}/{100} points</span>
                  </div>
                  <div className='mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700'>
                    <div
                      className='h-2 rounded-full bg-purple-600 transition-all duration-300'
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Refresh Button */}
      <div className='text-center'>
        <button
          onClick={fetchStats}
          className='rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        >
          Refresh Stats
        </button>
      </div>
    </div>
  );
} 