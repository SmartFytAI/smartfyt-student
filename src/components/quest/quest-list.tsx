'use client';

import { useEffect, useState } from 'react';

import { logger } from '@/lib/logger';
import { QuestService } from '@/lib/services/quest-service';
import { QuestResponse } from '@/types';

import { QuestCard } from './quest-card';

interface QuestListProps {
  userId: string;
  onCompleteQuest: (quest: QuestResponse) => void;
  refreshKey?: number;
}

export function QuestList({ userId, onCompleteQuest, refreshKey }: QuestListProps) {
  const [quests, setQuests] = useState<QuestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      logger.debug('⚔️ Fetching quests for user:', { userId });
      
      const userQuests = await QuestService.getUserQuests(userId);
      setQuests(userQuests);
      
      logger.debug('✅ Quests fetched successfully:', {
        count: userQuests.length,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quests';
      logger.error('❌ Error fetching quests:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, [userId, refreshKey]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-4 text-sm text-gray-600 dark:text-gray-400'>
            Loading your quests...
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
              Error loading quests
            </h3>
            <p className='mt-1 text-sm text-red-700 dark:text-red-300'>{error}</p>
            <button
              onClick={fetchQuests}
              className='mt-3 rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700'
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quests.length === 0) {
    return (
      <div className='rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700'>
          <span className='text-2xl'>⚔️</span>
        </div>
        <h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-white'>
          No quests available
        </h3>
        <p className='text-gray-600 dark:text-gray-400'>
          Check back tomorrow for new daily quests!
        </p>
        <button
          onClick={fetchQuests}
          className='mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700'
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
          Available Quests ({quests.length})
        </h3>
        <button
          onClick={fetchQuests}
          className='rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        >
          Refresh
        </button>
      </div>
      
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {quests.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onComplete={() => onCompleteQuest(quest)}
          />
        ))}
      </div>
    </div>
  );
} 