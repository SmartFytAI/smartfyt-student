'use client';

import { Activity, Droplets, Moon } from 'lucide-react';
import React from 'react';

import { CardErrorBoundary } from '@/components/error/error-boundary';
import { WidgetCard } from '@/components/ui/widget-card';
import { useHealthSummary } from '@/lib/services/health-service';

interface HealthMetricsWidgetProps {
  userId: string;
  onViewAll?: () => void;
}

function HealthMetricsWidgetContent({
  userId,
  onViewAll,
}: HealthMetricsWidgetProps) {
  // React Query hook for health data with caching
  const {
    data: healthResponse,
    isLoading,
    error,
    refetch,
  } = useHealthSummary(userId);

  const healthData = healthResponse?.data?.today || {
    steps: 0,
    calories: 0,
    activeMinutes: 0,
    sleepScore: 0,
    readinessScore: 0,
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className='py-6 text-center'>
          <div className='mb-2 text-4xl'>⚠️</div>
          <p className='text-sm font-medium dark:text-gray-300'>
            Unable to load health data
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      );
    }

    return (
      <div className='max-h-[400px] space-y-4 overflow-y-auto'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Moon className='h-4 w-4 text-success-600 dark:text-success-400' />
            <span className='dark:text-gray-300'>Sleep Score</span>
          </div>
          <span className='font-semibold text-success-600 dark:text-success-400'>
            {healthData.sleepScore}/100
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Activity className='h-4 w-4 text-warning-600 dark:text-warning-400' />
            <span className='dark:text-gray-300'>Steps</span>
          </div>
          <span className='font-semibold text-warning-600 dark:text-warning-400'>
            {healthData.steps.toLocaleString()}
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Droplets className='h-4 w-4 text-danger-600 dark:text-danger-400' />
            <span className='dark:text-gray-300'>Active Minutes</span>
          </div>
          <span className='font-semibold text-danger-600 dark:text-danger-400'>
            {healthData.activeMinutes}
          </span>
        </div>
      </div>
    );
  };

  return (
    <WidgetCard
      title='Health Metrics'
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

export function HealthMetricsWidget({
  userId,
  onViewAll,
}: HealthMetricsWidgetProps) {
  return (
    <CardErrorBoundary>
      <HealthMetricsWidgetContent userId={userId} onViewAll={onViewAll} />
    </CardErrorBoundary>
  );
}
