'use client';

import React from 'react';

import { CardErrorBoundary } from '@/components/error/error-boundary';
import { DashboardCalendar } from '@/components/journal/dashboard-calendar';
import { WidgetCard } from '@/components/ui/widget-card';
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
    <div className='max-h-[400px] space-y-4 overflow-y-auto'>
      <DashboardCalendar userId={userId} onDayClick={handleDayClick} />
    </div>
  );
}

export function JournalProgressWidget({
  userId,
  onViewAll,
}: JournalProgressWidgetProps) {
  return (
    <CardErrorBoundary>
      <WidgetCard
        title='Journal Progress'
        onViewAll={onViewAll}
        colorScheme='primary'
        showSkeleton={true}
      >
        <JournalProgressWidgetContent userId={userId} onViewAll={onViewAll} />
      </WidgetCard>
    </CardErrorBoundary>
  );
}
