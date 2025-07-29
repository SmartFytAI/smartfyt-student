'use client';

import {
  Calendar,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { CardErrorBoundary } from '@/components/error/error-boundary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import {
  JournalService,
  JournalPaginationParams,
} from '@/lib/services/journal-service';
import { Journal } from '@/types';

interface JournalListProps {
  userId: string;
  onJournalClick?: (journal: Journal) => void;
  isActive?: boolean; // Only load data when this tab is active
}

export function JournalList({
  userId,
  onJournalClick,
  isActive = true,
}: JournalListProps) {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });

  const loadJournals = useCallback(
    async (paginationParams?: JournalPaginationParams) => {
      try {
        setIsLoading(true);
        setError(null);

        logger.debug('📝 Loading journals for user:', {
          userId,
          paginationParams,
        });
        const response = await JournalService.getJournals(
          userId,
          paginationParams
        );
        setJournals(response.journals);
        setPagination(response.pagination);

        logger.debug('✅ Journals loaded successfully:', {
          count: response.journals.length,
          total: response.pagination.total,
          hasMore: response.pagination.hasMore,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load journals';
        logger.error('❌ Error loading journals:', { error: err, userId });
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (isActive) {
      loadJournals({ limit: 10, offset: 0 });
    }
  }, [loadJournals, isActive]);

  const handleLoadMore = () => {
    const nextOffset = pagination.offset + pagination.limit;
    loadJournals({ limit: pagination.limit, offset: nextOffset });
  };

  const handlePrevious = () => {
    const prevOffset = Math.max(0, pagination.offset - pagination.limit);
    loadJournals({ limit: pagination.limit, offset: prevOffset });
  };

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
      return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400';
    if (stress <= 4)
      return 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400';
    if (stress <= 6)
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    if (stress <= 8)
      return 'bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  };

  const getStressLevelText = (stress: number) => {
    if (stress <= 2) return 'Low';
    if (stress <= 4) return 'Moderate';
    if (stress <= 6) return 'Elevated';
    if (stress <= 8) return 'High';
    return 'Very High';
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {/* Pagination Skeleton */}
        <div className='flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700'>
          <div className='h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
          <div className='flex items-center gap-2'>
            <div className='h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
            <div className='h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
          </div>
        </div>

        {/* Journal Cards Skeleton */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-1'>
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className='flex items-start gap-3'>
                  <div className='h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700'></div>
                  <div className='flex-1 space-y-2'>
                    <div className='flex items-center justify-between'>
                      <div className='h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                      <div className='h-5 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                    </div>
                    <div className='h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                    <div className='h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                    <div className='flex items-center gap-2'>
                      <div className='h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                      <div className='h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                      <div className='h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='py-8 text-center'>
          <div className='mb-2 text-danger-600 dark:text-danger-400'>
            <BookOpen className='mx-auto h-8 w-8' />
          </div>
          <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
            {error}
          </p>
          <Button
            onClick={() => loadJournals({ limit: 10, offset: 0 })}
            variant='outline'
            size='sm'
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <CardErrorBoundary name='JournalList'>
      <div className='space-y-4'>
        {/* Entry Count and Top Pagination */}
        <div className='space-y-3'>
          {/* Top Pagination Controls */}
          {journals.length > 0 && (
            <div className='flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700'>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Showing {pagination.offset + 1} to{' '}
                {Math.min(
                  pagination.offset + pagination.limit,
                  pagination.total
                )}{' '}
                of {pagination.total} entries
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handlePrevious}
                  disabled={pagination.offset === 0}
                >
                  <ChevronLeft className='h-4 w-4' />
                  Previous
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleLoadMore}
                  disabled={!pagination.hasMore}
                >
                  Next
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
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
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Start your journaling journey by creating your first entry using
                the &quot;Today&apos;s Journal&quot; button above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-1'>
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

        {/* Pagination Controls */}
        {journals.length > 0 && (
          <div className='flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700'>
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              Showing {pagination.offset + 1} to{' '}
              {Math.min(pagination.offset + pagination.limit, pagination.total)}{' '}
              of {pagination.total} entries
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handlePrevious}
                disabled={pagination.offset === 0}
              >
                <ChevronLeft className='h-4 w-4' />
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleLoadMore}
                disabled={!pagination.hasMore}
              >
                Next
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </div>
    </CardErrorBoundary>
  );
}
