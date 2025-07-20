'use client';

import { QuestResponse } from '@/types';

interface QuestCardProps {
  quest: QuestResponse;
  onComplete: () => void;
}

export function QuestCard({ quest, onComplete }: QuestCardProps) {
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



  return (
    <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-gray-900/20'>
      {/* Quest Header */}
      <div className='mb-4 flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getCategoryColor(quest.categoryName)}`}>
              <span className='text-lg'>{getCategoryIcon(quest.categoryName)}</span>
            </div>
            <div>
              <h3 className='font-semibold text-gray-900 dark:text-white'>
                {quest.title}
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {quest.categoryName}
              </p>
            </div>
          </div>
          <div className='flex flex-col items-end gap-2'>
            <span className='inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'>
              Active
            </span>
            <div className='flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400'>
              <span>🏆</span>
              <span>{quest.pointValue} pts</span>
            </div>
          </div>
      </div>

      {/* Quest Description */}
      <p className='mb-4 text-sm text-gray-700 dark:text-gray-300'>
        {quest.description}
      </p>

      {/* Quest Actions */}
      <div className='flex items-center justify-between'>
        <div className='text-xs text-gray-500 dark:text-gray-400'>
          Status: <span className='font-medium text-blue-600 dark:text-blue-400'>Assigned</span>
        </div>
        <button
          onClick={onComplete}
          className='rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
        >
          Complete Quest
        </button>
      </div>
    </div>
  );
} 