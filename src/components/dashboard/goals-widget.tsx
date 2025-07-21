'use client';

import React from 'react';

import { CardErrorBoundary } from '@/components/error/error-boundary';
import { WidgetCard } from '@/components/ui/widget-card';
import { useUserGoals } from '@/lib/services/user-service';

interface GoalsWidgetProps {
  userId: string;
  onViewAll?: () => void;
}

function GoalsWidgetContent({ userId, onViewAll }: GoalsWidgetProps) {
  // React Query hook for user goals with caching
  const { data: goals, isLoading, error, refetch } = useUserGoals(userId);

  const renderContent = () => {
    if (error) {
      return (
        <div className='py-6 text-center'>
          <div className='mb-2 text-4xl'>⚠️</div>
          <p className='text-sm font-medium dark:text-gray-300'>
            Unable to load goals
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      );
    }

    if (!goals) {
      return (
        <div className='py-6 text-center'>
          <div className='mb-2 text-4xl'>🎯</div>
          <p className='text-sm font-medium dark:text-gray-300'>No Goals Set</p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Set your athletic and academic goals to get started
          </p>
        </div>
      );
    }

    return (
      <div className='space-y-3'>
        {goals.athletic && (
          <div className='rounded-md bg-secondary-50 p-3 dark:bg-secondary-900/20'>
            <p className='text-sm font-medium text-secondary-900 dark:text-secondary-100'>
              Athletic Goal
            </p>
            <p className='text-xs text-secondary-700 dark:text-secondary-300'>
              {goals.athletic}
            </p>
          </div>
        )}
        {goals.academic && (
          <div className='rounded-md bg-success-50 p-3 dark:bg-success-900/20'>
            <p className='text-sm font-medium text-success-900 dark:text-success-100'>
              Academic Goal
            </p>
            <p className='text-xs text-success-700 dark:text-success-300'>
              {goals.academic}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <WidgetCard
      title='Your Goals'
      onViewAll={onViewAll}
      loading={isLoading}
      error={error instanceof Error ? error.message : error}
      colorScheme='primary'
      onRetry={() => refetch()}
      showSkeleton={true}
    >
      {renderContent()}
    </WidgetCard>
  );
}

export function GoalsWidget({ userId, onViewAll }: GoalsWidgetProps) {
  return (
    <CardErrorBoundary>
      <GoalsWidgetContent userId={userId} onViewAll={onViewAll} />
    </CardErrorBoundary>
  );
}
