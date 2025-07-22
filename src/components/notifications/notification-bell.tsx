'use client';

import { Bell } from 'lucide-react';
import React from 'react';

import { CardErrorBoundary } from '@/components/error/error-boundary';
import { cn } from '@/lib/utils';

import { useNotifications } from './notification-provider';

interface NotificationBellProps {
  className?: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function NotificationBell({
  className,
  showCount = true,
  size = 'md',
  onClick,
}: NotificationBellProps) {
  return (
    <CardErrorBoundary name='NotificationBell'>
      <NotificationBellContent
        className={className}
        showCount={showCount}
        size={size}
        onClick={onClick}
      />
    </CardErrorBoundary>
  );
}

function NotificationBellContent({
  className,
  showCount = true,
  size = 'md',
  onClick,
}: NotificationBellProps) {
  const { unreadCount, hasUnreadNotifications } = useNotifications();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const badgeSizeClasses = {
    sm: 'h-3 w-3 text-xs',
    md: 'h-4 w-4 text-xs',
    lg: 'h-5 w-5 text-sm',
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      <Bell
        className={cn(
          sizeClasses[size],
          'transition-colors duration-200',
          hasUnreadNotifications
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-gray-500 dark:text-gray-400'
        )}
        onClick={onClick}
      />

      {showCount && hasUnreadNotifications && (
        <span
          className={cn(
            'absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-red-500 font-bold text-white',
            badgeSizeClasses[size]
          )}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
}
