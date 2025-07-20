'use client';

import { useState } from 'react';

import { logger } from '@/lib/logger';
import { QuestService } from '@/lib/services/quest-service';
import { QuestResponse } from '@/types';

interface QuestFormProps {
  userId: string;
  quest: QuestResponse;
  onCancel: () => void;
  onSuccess: (quest: QuestResponse) => void;
}

export function QuestForm({
  userId,
  quest,
  onCancel,
  onSuccess,
}: QuestFormProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notes.trim()) {
      setError('Please provide completion notes');
      return;
    }

    if (notes.length > 280) {
      setError('Notes must be 280 characters or less');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      logger.debug('⚔️ Submitting quest completion:', {
        questId: quest.id,
        notesLength: notes.length,
      });

      await QuestService.completeQuest(userId, quest.id, notes);

      logger.debug('✅ Quest completed successfully:', {
        questId: quest.id,
        pointsEarned: quest.pointValue,
      });

      // Call onSuccess with the completed quest
      onSuccess(quest);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to complete quest';
      logger.error('❌ Error completing quest:', err);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className='mx-auto max-w-2xl'>
      <div className='mb-6'>
        <button
          onClick={onCancel}
          className='mb-4 flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
        >
          ← Back to quests
        </button>

        <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-6 flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20'>
              <span className='text-2xl'>
                {getCategoryIcon(quest.categoryName)}
              </span>
            </div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Complete Quest
              </h2>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {quest.categoryName} • {quest.pointValue} points
              </p>
            </div>
          </div>

          <div className='mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700'>
            <h3 className='mb-2 font-medium text-gray-900 dark:text-white'>
              {quest.title}
            </h3>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              {quest.description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label
                htmlFor='notes'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300'
              >
                Completion Notes *
              </label>
              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                Tell us how you completed this quest (1-280 characters)
              </p>
              <textarea
                id='notes'
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                className='mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-purple-400 dark:focus:ring-purple-400'
                placeholder='Describe how you completed this quest...'
                maxLength={280}
              />
              <div className='mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400'>
                <span>{notes.length}/280 characters</span>
                <span>{280 - notes.length} remaining</span>
              </div>
            </div>

            {error && (
              <div className='rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20'>
                <p className='text-sm text-red-700 dark:text-red-300'>
                  {error}
                </p>
              </div>
            )}

            <div className='flex gap-3'>
              <button
                type='button'
                onClick={onCancel}
                disabled={isSubmitting}
                className='flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={isSubmitting || !notes.trim()}
                className='flex-1 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-800'
              >
                {isSubmitting ? (
                  <div className='flex items-center justify-center'>
                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                    Completing...
                  </div>
                ) : (
                  `Complete Quest (+${quest.pointValue} pts)`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
