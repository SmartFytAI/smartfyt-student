'use client';

import { Calendar, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import { CardErrorBoundary } from '@/components/error/error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useJournalDates } from '@/lib/services/journal-service';

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
  refreshKey: _refreshKey,
}: JournalCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-8'>
          <div className='mb-4 text-4xl'>⚠️</div>
          <p className='text-center text-muted-foreground'>
            Compete with your teammates and see who&apos;s earning the most
            quest points!
          </p>
          <Button onClick={() => refetch()} variant='outline'>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <CardErrorBoundary name='JournalCalendar'>
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
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-500'>
              Click on any past day to view or create a journal entry
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {isLoading && (
            <div className='flex items-center justify-center py-8'>
              <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent'></div>
            </div>
          )}

          {/* Calendar Grid */}
          {!isLoading && (
            <>
              {/* Day Headers */}
              <div className='mb-2 grid grid-cols-7 gap-1 text-center'>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                  (day, index) => (
                    <div
                      key={`header-${index}`}
                      className='text-xs font-medium text-gray-500'
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              {/* Calendar Days */}
              <div className='grid grid-cols-7 gap-1 px-6 py-4'>
                {calendarDays.map((day, _index) => (
                  <div
                    key={`day-${day.date.toISOString()}`}
                    className={`
                      relative flex aspect-square items-center justify-center rounded-lg transition-all duration-200
                      ${getDayClass(day)}
                      ${!day.isFuture ? 'hover:scale-105' : ''}
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
                      <div className='absolute -right-1 -top-1 h-2 w-2 rounded-full bg-white opacity-80'></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Completion Stats */}
              <div className='mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    This month&apos;s completion
                  </span>
                  <span className='font-medium'>
                    {stats.completed}/{stats.total} days ({stats.rate}%)
                  </span>
                </div>
                <div className='mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700'>
                  <div
                    className='h-2 rounded-full bg-primary-500 transition-all duration-300'
                    style={{ width: `${stats.rate}%` }}
                  ></div>
                </div>
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
            </>
          )}
        </CardContent>
      </Card>
    </CardErrorBoundary>
  );
}
