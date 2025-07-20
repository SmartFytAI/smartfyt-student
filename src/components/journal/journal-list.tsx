'use client';

import { Calendar, Clock, Plus, BookOpen } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import { JournalService } from '@/lib/services/journal-service';
import { Journal } from '@/types';

interface JournalListProps {
  userId: string;
  onCreateNew?: () => void;
  onJournalClick?: (journal: Journal) => void;
}

export function JournalList({
  userId,
  onCreateNew,
  onJournalClick,
}: JournalListProps) {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJournals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      logger.debug('📝 Loading journals for user:', { userId });
      const journalData = await JournalService.getJournals(userId);
      setJournals(journalData);

      logger.debug('✅ Journals loaded successfully:', {
        count: journalData.length,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load journals';
      logger.error('❌ Error loading journals:', { error: err, userId });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getJournalPreview = (journal: Journal) => {
    if (journal.wentWell) return journal.wentWell;
    if (journal.goals) return journal.goals;
    if (journal.notWell) return journal.notWell;
    return 'No content preview available';
  };

  const getStressLevelColor = (stress: number) => {
    if (stress <= 2)
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (stress <= 4)
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getStressLevelText = (stress: number) => {
    if (stress <= 2) return 'Low';
    if (stress <= 4) return 'Medium';
    return 'High';
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center'>
          <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
            Loading journals...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-8 text-center'>
        <div className='mb-2 text-red-600 dark:text-red-400'>
          <BookOpen className='mx-auto h-8 w-8' />
        </div>
        <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>{error}</p>
        <Button onClick={loadJournals} variant='outline' size='sm'>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Entry Count and New Button */}
      <div className='flex items-center justify-between'>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          {journals.length} {journals.length === 1 ? 'entry' : 'entries'}
        </p>
        {onCreateNew && (
          <Button onClick={onCreateNew} size='sm'>
            <Plus className='mr-2 h-4 w-4' />
            New Entry
          </Button>
        )}
      </div>

      {/* Journal List */}
      {journals.length === 0 ? (
        <Card>
          <CardContent className='py-8 text-center'>
            <BookOpen className='mx-auto mb-4 h-12 w-12 text-gray-400' />
            <h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-white'>
              No journal entries yet
            </h3>
            <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
              Start your journaling journey by creating your first entry.
            </p>
            {onCreateNew && (
              <Button onClick={onCreateNew}>
                <Plus className='mr-2 h-4 w-4' />
                Create First Entry
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-3'>
          {journals.map(journal => (
            <Card
              key={journal.id}
              className='cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md'
              onClick={() => onJournalClick?.(journal)}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <CardTitle className='text-lg font-semibold text-gray-900 dark:text-white'>
                      {journal.title}
                    </CardTitle>
                    <div className='mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='h-4 w-4' />
                        {formatDate(journal.createdAt)}
                      </div>
                      <div className='flex items-center gap-1'>
                        <Clock className='h-4 w-4' />
                        {formatTime(journal.createdAt)}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStressLevelColor(journal.stress)}>
                    Stress: {getStressLevelText(journal.stress)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <p className='line-clamp-2 text-sm text-gray-700 dark:text-gray-300'>
                  {getJournalPreview(journal)}
                </p>

                {/* Quick Stats */}
                <div className='mt-3 flex items-center gap-4 border-t border-gray-100 pt-3 dark:border-gray-700'>
                  {journal.sleepHours > 0 && (
                    <div className='text-xs text-gray-600 dark:text-gray-400'>
                      💤 {journal.sleepHours}h sleep
                    </div>
                  )}
                  {journal.activeHours > 0 && (
                    <div className='text-xs text-gray-600 dark:text-gray-400'>
                      🏃 {journal.activeHours}h active
                    </div>
                  )}
                  {journal.studyHours > 0 && (
                    <div className='text-xs text-gray-600 dark:text-gray-400'>
                      📚 {journal.studyHours}h study
                    </div>
                  )}
                  {journal.screenTime > 0 && (
                    <div className='text-xs text-gray-600 dark:text-gray-400'>
                      📱 {journal.screenTime}h screen
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
