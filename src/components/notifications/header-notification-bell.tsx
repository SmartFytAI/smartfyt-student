'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { CardErrorBoundary } from '@/components/error/error-boundary';
import { cn } from '@/lib/utils';

import { useNotifications } from './notification-provider';

interface HeaderNotificationBellProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function HeaderNotificationBell({
  className,
  size = 'md',
}: HeaderNotificationBellProps) {
  return (
    <CardErrorBoundary name='HeaderNotificationBell'>
      <HeaderNotificationBellContent className={className} size={size} />
    </CardErrorBoundary>
  );
}

function HeaderNotificationBellContent({
  className,
  size = 'md',
}: HeaderNotificationBellProps) {
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
    <Link
      href='/notifications'
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg p-2 transition-colors',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        className
      )}
      aria-label={`View notifications (${unreadCount} unread)`}
    >
      <Bell
        className={cn(
          sizeClasses[size],
          'transition-colors duration-200',
          hasUnreadNotifications
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-gray-500 dark:text-gray-400'
        )}
      />

      {hasUnreadNotifications && (
        <span
          className={cn(
            'absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-red-500 font-bold text-white',
            badgeSizeClasses[size]
          )}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
