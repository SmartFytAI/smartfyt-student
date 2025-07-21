'use client';

import { useState } from 'react';

import { useJournalDates } from '@/lib/services/journal-service';

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
  const [currentMonth, _setCurrentMonth] = useState(new Date());

  // React Query hook for journal dates with caching
  const {
    data: journalDates = [],
    isLoading,
    error,
    refetch,
  } = useJournalDates(userId);

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
      const isToday = date.getTime() === today.getTime();
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

  const getCompletionStats = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const monthDays = journalDates.filter(dateString => {
      const date = new Date(dateString);
      return (
        date.getFullYear() === currentYear && date.getMonth() === currentMonth
      );
    });

    const totalDaysInMonth = new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();
    const completionRate = Math.round(
      (monthDays.length / totalDaysInMonth) * 100
    );

    return {
      completed: monthDays.length,
      total: totalDaysInMonth,
      rate: completionRate,
    };
  };

  const calendarDays = generateCalendarDays();
  const stats = getCompletionStats();

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center py-4'>
        <div className='mb-2 text-2xl'>⚠️</div>
        <p className='mb-2 text-center text-xs text-gray-600 dark:text-gray-400'>
          {error instanceof Error ? error.message : 'Failed to load calendar'}
        </p>
        <button
          onClick={() => refetch()}
          className='text-xs text-primary-600 hover:text-primary-700'
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {/* Header */}
      <div className='text-center'>
        <h4 className='text-sm font-semibold text-gray-900 dark:text-white'>
          {formatMonthYear(currentMonth)}
        </h4>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className='space-y-3'>
          {/* Day Headers Skeleton */}
          <div className='grid grid-cols-7 gap-0.5 text-center'>
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className='py-1 text-center'>
                <div className='mx-auto h-3 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
              </div>
            ))}
          </div>

          {/* Calendar Grid Skeleton */}
          <div className='grid grid-cols-7 gap-0.5 px-4 py-3'>
            {Array.from({ length: 35 }, (_, i) => (
              <div
                key={i}
                className='aspect-square animate-pulse rounded bg-gray-200 dark:bg-gray-700'
              ></div>
            ))}
          </div>

          {/* Legend Skeleton */}
          <div className='flex items-center justify-center gap-3'>
            <div className='flex items-center gap-1'>
              <div className='h-2 w-2 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
              <div className='h-3 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-2 w-2 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
              <div className='h-3 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      {!isLoading && (
        <>
          {/* Day Headers */}
          <div className='grid grid-cols-7 gap-1 text-center'>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div
                key={`header-${index}`}
                className='text-xs font-medium text-gray-500'
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className='grid grid-cols-7 gap-0.5 px-4 py-3'>
            {calendarDays.map((day, _index) => (
              <div
                key={`day-${day.date.toISOString()}`}
                className={`
                    relative flex aspect-square items-center justify-center rounded transition-all duration-200
                    ${getDayClass(day)}
                    ${!day.isFuture ? 'hover:scale-110' : ''}
                  `}
                onClick={() => handleDayClick(day)}
                title={
                  day.isToday
                    ? 'Today'
                    : day.isCompleted
                      ? `Journal completed on ${day.date.toLocaleDateString()}`
                      : day.isFuture
                        ? 'Future date'
                        : `Click to view journal for ${day.date.toLocaleDateString()}`
                }
              >
                <span className='text-xs font-medium text-white'>
                  {day.date.getDate()}
                </span>
                {day.isCompleted && (
                  <div className='absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-white opacity-80'></div>
                )}
              </div>
            ))}
          </div>

          {/* Completion Stats */}
          <div className='rounded bg-gray-50 p-2 dark:bg-gray-800'>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-gray-600 dark:text-gray-400'>
                This month
              </span>
              <span className='font-medium'>
                {stats.completed}/{stats.total} ({stats.rate}%)
              </span>
            </div>
            <div className='mt-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700'>
              <div
                className='h-1 rounded-full bg-primary-500 transition-all duration-300'
                style={{ width: `${stats.rate}%` }}
              ></div>
            </div>
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
        </>
      )}
    </div>
  );
}
