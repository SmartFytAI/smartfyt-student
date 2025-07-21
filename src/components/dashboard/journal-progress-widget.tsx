'use client';

import React from 'react';

import { CardErrorBoundary } from '@/components/error/error-boundary';
import { DashboardCalendar } from '@/components/journal/dashboard-calendar';
import { logger } from '@/lib/logger';

interface JournalProgressWidgetProps {
  userId: string;
  onViewAll?: () => void;
}

function JournalProgressWidgetContent({
  userId,
  onViewAll,
}: JournalProgressWidgetProps) {
  const handleDayClick = (date: Date) => {
    logger.debug('📅 Journal progress widget day clicked:', { date });
    // Navigate to journal page - this will be handled by the parent
    if (onViewAll) {
      onViewAll();
    }
  };

  return (
    <div className='space-y-4'>
      <DashboardCalendar userId={userId} onDayClick={handleDayClick} />
    </div>
  );
}

export function JournalProgressWidget({
  userId,
  onViewAll,
}: JournalProgressWidgetProps) {
  return (
    <CardErrorBoundary
      fallback={
        <div className='py-6 text-center'>
          <div className='mb-2 text-4xl'>📅</div>
          <p className='text-sm font-medium dark:text-gray-300'>
            Journal Progress
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Unable to load journal progress
          </p>
        </div>
      }
    >
      <JournalProgressWidgetContent userId={userId} onViewAll={onViewAll} />
    </CardErrorBoundary>
  );
}
