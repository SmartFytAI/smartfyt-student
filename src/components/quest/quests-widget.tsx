'use client';

import { useCallback, useEffect, useState } from 'react';

import { logger } from '@/lib/logger';
import { getCurrentQuests, type Quest } from '@/lib/services/quest-service';

interface QuestsWidgetProps {
  userId: string;
  onViewAll: () => void;
}

export function QuestsWidget({ userId, onViewAll }: QuestsWidgetProps) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      logger.debug('⚔️ Fetching quests for dashboard widget:', { userId });

      const quests = await getCurrentQuests(userId);
      setQuests(quests);

      logger.debug('✅ Dashboard quests fetched successfully:', {
        count: quests.length,
      });
    } catch (err) {
      logger.error('❌ Error fetching dashboard quests:', err);
      setError('Failed to load quests');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchQuests();
  }, [userId, fetchQuests]);

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

  if (isLoading) {
    return (
      <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/20'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold dark:text-white'>
            Today&apos;s Quests
          </h3>
          <button
            onClick={onViewAll}
            className='text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
          >
            View All →
          </button>
        </div>
        <div className='py-8 text-center'>
          <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600'></div>
          <p className='mt-4 text-sm text-gray-600 dark:text-gray-400'>
            Loading quests...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/20'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold dark:text-white'>
            Today&apos;s Quests
          </h3>
          <button
            onClick={onViewAll}
            className='text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
          >
            View All →
          </button>
        </div>
        <div className='py-8 text-center'>
          <div className='mb-2 text-4xl'>⚠️</div>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Unable to load quests
          </p>
          <button
            onClick={fetchQuests}
            className='mt-2 rounded-md bg-purple-600 px-3 py-1 text-xs text-white transition-colors hover:bg-purple-700'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (quests.length === 0) {
    return (
      <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/20'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold dark:text-white'>
            Today&apos;s Quests
          </h3>
          <button
            onClick={onViewAll}
            className='text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
          >
            View All →
          </button>
        </div>
        <div className='py-8 text-center'>
          <div className='mb-2 text-4xl'>⚔️</div>
          <p className='text-gray-600 dark:text-gray-400'>
            No quests available
          </p>
          <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
            Check back tomorrow for new challenges!
          </p>
          <button
            onClick={onViewAll}
            className='mt-4 rounded-md bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700'
          >
            View Quests
          </button>
        </div>
      </div>
    );
  }

  // Show up to 3 quests in the widget
  const displayQuests = quests.slice(0, 3);
  const remainingCount = quests.length - 3;

  return (
    <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/20'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-lg font-semibold dark:text-white'>
          Today&apos;s Quests ({quests.length})
        </h3>
        <button
          onClick={onViewAll}
          className='text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
        >
          View All →
        </button>
      </div>

      <div className='space-y-3'>
        {displayQuests.map(quest => (
          <div
            key={quest.id}
            className='flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'
          >
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20'>
              <span className='text-sm'>
                {getCategoryIcon(quest.categoryName)}
              </span>
            </div>
            <div className='min-w-0 flex-1'>
              <h4 className='truncate text-sm font-medium text-gray-900 dark:text-white'>
                {quest.title}
              </h4>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                {quest.categoryName} • {quest.pointValue} pts
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <span className='inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'>
                Active
              </span>
            </div>
          </div>
        ))}

        {remainingCount > 0 && (
          <div className='text-center'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              +{remainingCount} more quest{remainingCount === 1 ? '' : 's'}{' '}
              available
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onViewAll}
        className='mt-4 w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700'
      >
        Complete Quests
      </button>
    </div>
  );
}
