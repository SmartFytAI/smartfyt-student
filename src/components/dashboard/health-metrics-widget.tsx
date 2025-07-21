'use client';

import { Activity, Droplets, Moon } from 'lucide-react';
import React from 'react';

import { CardErrorBoundary } from '@/components/error/error-boundary';

interface HealthMetricsWidgetProps {
  userId: string;
  onViewAll?: () => void;
}

function HealthMetricsWidgetContent({
  userId: _userId,
  onViewAll: _onViewAll,
}: HealthMetricsWidgetProps) {
  // TODO: Replace with actual health data API call
  // For now, using mock data as placeholder
  const healthData = {
    sleep: '8h',
    steps: '6,420',
    hydration: '64oz',
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <Moon className='h-4 w-4 text-success-600 dark:text-success-400' />
          <span className='dark:text-gray-300'>Sleep</span>
        </div>
        <span className='font-semibold text-success-600 dark:text-success-400'>
          {healthData.sleep}
        </span>
      </div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <Activity className='h-4 w-4 text-warning-600 dark:text-warning-400' />
          <span className='dark:text-gray-300'>Steps</span>
        </div>
        <span className='font-semibold text-warning-600 dark:text-warning-400'>
          {healthData.steps}
        </span>
      </div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <Droplets className='h-4 w-4 text-danger-600 dark:text-danger-400' />
          <span className='dark:text-gray-300'>Hydration</span>
        </div>
        <span className='font-semibold text-danger-600 dark:text-danger-400'>
          {healthData.hydration}
        </span>
      </div>
    </div>
  );
}

export function HealthMetricsWidget({
  userId,
  onViewAll,
}: HealthMetricsWidgetProps) {
  return (
    <CardErrorBoundary
      fallback={
        <div className='py-6 text-center'>
          <div className='mb-2 text-4xl'>❤️</div>
          <p className='text-sm font-medium dark:text-gray-300'>
            Health Metrics
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Unable to load health data
          </p>
        </div>
      }
    >
      <HealthMetricsWidgetContent userId={userId} onViewAll={onViewAll} />
    </CardErrorBoundary>
  );
}
