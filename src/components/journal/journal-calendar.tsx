'use client';

import { Calendar, TrendingUp } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import { JournalService } from '@/lib/services/journal-service';

interface JournalCalendarProps {
  userId: string;
  onDayClick?: (date: Date) => void;
  onViewStats?: () => void;
  refreshKey?: number; // Add refresh key to trigger reloads
}

interface CalendarDay {
  date: Date;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export function JournalCalendar({
  userId,
  onDayClick,
  onViewStats,
  refreshKey,
}: JournalCalendarProps) {
  const [journalDates, setJournalDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const loadJournalDates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      logger.debug('📅 Loading journal dates for calendar:', { userId });
      const dates = await JournalService.getJournalDates(userId);
      setJournalDates(dates);

      logger.debug('✅ Journal dates loaded for calendar:', {
        count: dates.length,
        dates: dates.slice(0, 10), // Log first 10 dates for debugging
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load journal dates';
      logger.error('❌ Error loading journal dates for calendar:', {
        error: err,
        userId,
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadJournalDates();
  }, [loadJournalDates, refreshKey]);

  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get the first day of the current month
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );

    // Get the last day of the current month
    const lastDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    // Get the start of the week for the first day (Sunday)
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay(); // Sunday = 0, Monday = 1, etc.
    const daysToSubtract = dayOfWeek; // No need to adjust for Sunday start
    startDate.setDate(firstDay.getDate() - daysToSubtract);

    // Get the end of the week for the last day (Saturday)
    const endDate = new Date(lastDay);
    const lastDayOfWeek = lastDay.getDay();
    const daysToAdd = 6 - lastDayOfWeek; // Days to get to Saturday
    endDate.setDate(lastDay.getDate() + daysToAdd);

    // Generate days from start to end date
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const date = new Date(currentDate);

      const dateString = date.toISOString().split('T')[0];
      const isCompleted = journalDates.includes(dateString);
      const isToday = date.toDateString() === today.toDateString();
      const isFuture = date > today;

      days.push({
        date,
        isCompleted,
        isToday,
        isFuture,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getDayClass = (day: CalendarDay) => {
    if (day.isFuture) {
      return 'bg-gray-700 dark:bg-gray-800 opacity-50';
    }
    if (day.isCompleted) {
      return 'bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 cursor-pointer shadow-md';
    }
    if (day.isToday) {
      return 'bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 cursor-pointer shadow-md border-2 border-white dark:border-gray-200';
    }
    return 'bg-gray-700 dark:bg-gray-800 cursor-pointer hover:bg-gray-600 dark:hover:bg-gray-700 border border-gray-600 dark:border-gray-600';
  };

  const handleDayClick = (day: CalendarDay) => {
    if (day.isFuture) return;
    onDayClick?.(day.date);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const getCompletionStats = () => {
    const days = generateCalendarDays();
    const completedDays = days.filter(day => day.isCompleted).length;
    const totalDays = days.filter(day => !day.isFuture).length;
    return { completedDays, totalDays };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-8'>
          <div className='text-center'>
            <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-secondary-600'></div>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              Loading calendar...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='py-8 text-center'>
          <div className='mb-2 text-danger-600 dark:text-danger-400'>
            <Calendar className='mx-auto h-8 w-8' />
          </div>
          <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
            {error}
          </p>
          <Button onClick={loadJournalDates} variant='outline' size='sm'>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const calendarDays = generateCalendarDays();
  const { completedDays, totalDays } = getCompletionStats();
  const completionRate =
    totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Journal Calendar
          </CardTitle>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={goToPreviousMonth}>
              ←
            </Button>
            <Button variant='outline' size='sm' onClick={goToToday}>
              Today
            </Button>
            <Button variant='outline' size='sm' onClick={goToNextMonth}>
              →
            </Button>
          </div>
        </div>
        <div className='text-center'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            {formatMonthYear(currentMonth)}
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {completedDays} of {totalDays} days completed ({completionRate}%)
          </p>
          <p className='mt-1 text-xs text-gray-500 dark:text-gray-500'>
            Click on any past day to view or create a journal entry
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {/* Day Headers */}
        <div className='mb-2 grid grid-cols-7 gap-1'>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div
              key={day}
              className='py-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400'
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className='grid grid-cols-7 gap-1 px-6 py-4'>
          {calendarDays.map(day => {
            const tooltipText = day.isFuture
              ? `${day.date.toLocaleDateString()} (Future date)`
              : day.isCompleted
                ? `${day.date.toLocaleDateString()} - Journal completed (click to view)`
                : `${day.date.toLocaleDateString()} - No journal (click to create)`;

            return (
              <div
                key={day.date.toISOString()}
                className={`
                  relative flex aspect-square items-center justify-center rounded-lg transition-all duration-200
                  ${getDayClass(day)}
                  ${!day.isFuture ? 'hover:scale-105' : ''}
                `}
                onClick={() => handleDayClick(day)}
                title={tooltipText}
              >
                <span className='text-xs font-medium text-white'>
                  {day.date.getDate()}
                </span>
                {day.isCompleted && (
                  <div className='absolute -right-1 -top-1 h-2 w-2 rounded-full bg-white opacity-80'></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className='mt-4 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1'>
              <div className='relative h-3 w-3 rounded bg-gradient-to-br from-orange-400 to-orange-600'>
                <div className='absolute -right-0.5 -top-0.5 h-1 w-1 rounded-full bg-white opacity-80'></div>
              </div>
              <span>Completed (click to view)</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-3 w-3 rounded border border-white bg-gradient-to-br from-orange-400 to-orange-600'></div>
              <span>Today</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-3 w-3 rounded border border-gray-600 bg-gray-700'></div>
              <span>Empty (click to create)</span>
            </div>
          </div>

          {onViewStats && (
            <Button
              variant='outline'
              size='sm'
              onClick={onViewStats}
              className='flex items-center gap-1'
            >
              <TrendingUp className='h-3 w-3' />
              VIEW STATS
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
