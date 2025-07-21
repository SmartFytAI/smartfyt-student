'use client';

import { Calendar } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { logger } from '@/lib/logger';
import { JournalService } from '@/lib/services/journal-service';

interface DashboardCalendarProps {
  userId: string;
  onDayClick?: (date: Date) => void;
}

interface CalendarDay {
  date: Date;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export function DashboardCalendar({
  userId,
  onDayClick,
}: DashboardCalendarProps) {
  const [journalDates, setJournalDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, _setCurrentMonth] = useState(new Date());

  const loadJournalDates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      logger.debug('📅 Loading journal dates for dashboard calendar:', {
        userId,
      });
      const dates = await JournalService.getJournalDates(userId);
      setJournalDates(dates);

      logger.debug('✅ Journal dates loaded for dashboard calendar:', {
        count: dates.length,
        dates: dates.slice(0, 5), // Log first 5 dates for debugging
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load journal dates';
      logger.error('❌ Error loading journal dates for dashboard calendar:', {
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
  }, [loadJournalDates]);

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
      month: 'short',
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

  const getCompletionStats = () => {
    const days = generateCalendarDays();
    const completedDays = days.filter(day => day.isCompleted).length;
    const totalDays = days.filter(day => !day.isFuture).length;
    return { completedDays, totalDays };
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-4'>
        <div className='text-center'>
          <div className='mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-secondary-600'></div>
          <p className='mt-2 text-xs text-gray-600 dark:text-gray-400'>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-4 text-center'>
        <div className='mb-2 text-danger-600 dark:text-danger-400'>
          <Calendar className='mx-auto h-6 w-6' />
        </div>
        <p className='mb-2 text-xs text-gray-600 dark:text-gray-400'>{error}</p>
        <button
          onClick={loadJournalDates}
          className='text-xs text-secondary-600 hover:text-secondary-700'
        >
          Try Again
        </button>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();
  const { completedDays, totalDays } = getCompletionStats();
  const completionRate =
    totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  return (
    <div className='space-y-3'>
      {/* Month Header */}
      <div className='text-center'>
        <h4 className='text-sm font-semibold text-gray-900 dark:text-white'>
          {formatMonthYear(currentMonth)}
        </h4>
        <p className='text-xs text-gray-600 dark:text-gray-400'>
          {completedDays} of {totalDays} days ({completionRate}%)
        </p>
      </div>

      {/* Day Headers */}
      <div className='mb-1 grid grid-cols-7 gap-0.5'>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div
            key={`day-header-${index}`}
            className='py-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400'
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className='grid grid-cols-7 gap-0.5 px-4 py-3'>
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
                relative flex aspect-square items-center justify-center rounded transition-all duration-200
                ${getDayClass(day)}
                ${!day.isFuture ? 'hover:scale-110' : ''}
              `}
              onClick={() => handleDayClick(day)}
              title={tooltipText}
            >
              <span className='text-xs font-medium text-white'>
                {day.date.getDate()}
              </span>
              {day.isCompleted && (
                <div className='absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-white opacity-80'></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className='flex items-center justify-center gap-3 text-xs text-gray-600 dark:text-gray-400'>
        <div className='flex items-center gap-1'>
          <div className='relative h-2 w-2 rounded bg-gradient-to-br from-orange-400 to-orange-600'>
            <div className='absolute -right-0.5 -top-0.5 h-0.5 w-0.5 rounded-full bg-white opacity-80'></div>
          </div>
          <span>Completed</span>
        </div>
        <div className='flex items-center gap-1'>
          <div className='h-2 w-2 rounded border border-gray-600 bg-gray-700'></div>
          <span>Empty</span>
        </div>
      </div>
    </div>
  );
}
