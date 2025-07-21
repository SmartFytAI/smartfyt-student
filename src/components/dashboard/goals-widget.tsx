'use client';

import React from 'react';

import { CardErrorBoundary } from '@/components/error/error-boundary';

interface Goal {
  id: string;
  title: string;
  target: string;
  current?: string;
  type: 'athletic' | 'academic';
}

interface GoalsWidgetProps {
  userId: string;
  onViewAll?: () => void;
}

function GoalsWidgetContent({
  userId: _userId,
  onViewAll: _onViewAll,
}: GoalsWidgetProps) {
  // TODO: Replace with actual goals API call
  // For now, using mock data as placeholder
  const goals: Goal[] = [
    {
      id: '1',
      title: 'Improve 40-yard dash',
      target: '4.8s',
      type: 'athletic',
    },
    {
      id: '2',
      title: 'Maintain 3.5 GPA',
      target: '3.5',
      current: '3.6',
      type: 'academic',
    },
  ];

  const getGoalClass = (type: Goal['type']) => {
    return type === 'athletic'
      ? 'bg-secondary-50 dark:bg-secondary-900/20'
      : 'bg-success-50 dark:bg-success-900/20';
  };

  const getTextClass = (type: Goal['type']) => {
    return type === 'athletic'
      ? 'text-secondary-900 dark:text-secondary-100'
      : 'text-success-900 dark:text-success-100';
  };

  const getSubtextClass = (type: Goal['type']) => {
    return type === 'athletic'
      ? 'text-secondary-700 dark:text-secondary-300'
      : 'text-success-700 dark:text-success-300';
  };

  return (
    <div className='space-y-3'>
      {goals.map(goal => (
        <div
          key={goal.id}
          className={`rounded-md p-3 ${getGoalClass(goal.type)}`}
        >
          <p className={`text-sm font-medium ${getTextClass(goal.type)}`}>
            {goal.title}
          </p>
          <p className={`text-xs ${getSubtextClass(goal.type)}`}>
            Target: {goal.target}
            {goal.current && ` | Current: ${goal.current}`}
          </p>
        </div>
      ))}
    </div>
  );
}

export function GoalsWidget({ userId, onViewAll }: GoalsWidgetProps) {
  return (
    <CardErrorBoundary
      fallback={
        <div className='py-6 text-center'>
          <div className='mb-2 text-4xl'>🎯</div>
          <p className='text-sm font-medium dark:text-gray-300'>Your Goals</p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Unable to load goals
          </p>
        </div>
      }
    >
      <GoalsWidgetContent userId={userId} onViewAll={onViewAll} />
    </CardErrorBoundary>
  );
}
