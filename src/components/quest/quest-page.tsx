'use client';

import { useState } from 'react';

import { logger } from '@/lib/logger';
import { QuestResponse } from '@/types';

import { QuestForm } from './quest-form';
import { QuestList } from './quest-list';
import { QuestStats } from './quest-stats';

interface QuestPageProps {
  userId: string;
}

type QuestView = 'list' | 'complete' | 'stats';

export function QuestPage({ userId }: QuestPageProps) {
  const [currentView, setCurrentView] = useState<QuestView>('list');
  const [selectedQuest, setSelectedQuest] = useState<QuestResponse | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  const handleCompleteQuest = (quest: QuestResponse) => {
    logger.debug('⚔️ Quest completion requested:', {
      questId: quest.id,
      questTitle: quest.title,
    });
    setSelectedQuest(quest);
    setCurrentView('complete');
  };

  const handleCancelComplete = () => {
    logger.debug('❌ Quest completion canceled');
    setCurrentView('list');
    setSelectedQuest(null);
  };

  const handleQuestCompleted = (quest: QuestResponse) => {
    logger.debug('✅ Quest completed successfully:', {
      questId: quest.id,
      questTitle: quest.title,
    });
    setCurrentView('list');
    setSelectedQuest(null);
    // Refresh the list to show updated quests
    setListRefreshKey(prev => prev + 1);
  };

  const handleShowStats = () => {
    logger.debug('📊 Switching to quest stats view');
    setCurrentView('stats');
  };

  const handleShowList = () => {
    logger.debug('📝 Switching to quest list view');
    setCurrentView('list');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'complete':
        return selectedQuest ? (
          <QuestForm
            userId={userId}
            quest={selectedQuest}
            onCancel={handleCancelComplete}
            onSuccess={handleQuestCompleted}
          />
        ) : null;

      case 'stats':
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                Quest Statistics
              </h2>
              <button
                onClick={handleShowList}
                className='rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300'
              >
                View Quests →
              </button>
            </div>
            <QuestStats userId={userId} />
          </div>
        );

      case 'list':
      default:
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                Your Daily Quests
              </h2>
              <button
                onClick={handleShowStats}
                className='rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300'
              >
                View Stats →
              </button>
            </div>
            <QuestList
              userId={userId}
              onCompleteQuest={handleCompleteQuest}
              refreshKey={listRefreshKey}
            />
          </div>
        );
    }
  };

  return (
    <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
      {renderContent()}
    </div>
  );
} 