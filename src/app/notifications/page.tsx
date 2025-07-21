'use client';

import { formatDistanceToNow } from 'date-fns';
import { CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { AuthGuard } from '@/components/auth';
import { useNotifications } from '@/components/notifications/notification-provider';
import { PageLayout } from '@/components/layout/page-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trackPageView } from '@/lib/analytics';
import { logger } from '@/lib/logger';
import { NotificationService } from '@/lib/services/notification-service';

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead, isLoading } =
    useNotifications();
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  // Track page view
  React.useEffect(() => {
    trackPageView('notifications');
  }, []);

  const handleNotificationClick = async (notification: any) => {
    try {
      // Mark as read if not already read
      if (!notification.read) {
        await markAsRead(notification.id);
      }

      // Navigate if link exists
      if (notification.link) {
        router.push(notification.link);
      }
    } catch (error) {
      logger.error('Failed to handle notification click:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAllRead(true);
      await markAllAsRead();
    } catch (error) {
      logger.error('Failed to mark all as read:', error);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  return (
    <AuthGuard>
      <PageLayout
        title='Notifications'
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
      >
        <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
          {/* Header with actions */}
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                Notifications
              </h1>
              <p className='text-sm text-muted-foreground'>
                Stay updated with your team activities and achievements
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant='outline'
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllRead}
                className='flex items-center gap-2'
              >
                <CheckCheck className='h-4 w-4' />
                Mark all read
              </Button>
            )}
          </div>

          {/* Notifications list */}
          <div className='space-y-4'>
            {isLoading ? (
              // Loading skeleton
              <div className='space-y-4'>
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className='flex items-start gap-4 rounded-lg border p-4'
                  >
                    <div className='h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700' />
                    <div className='flex-1 space-y-2'>
                      <div className='h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
                      <div className='h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              // Empty state
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <div className='mb-4 text-6xl'>🔔</div>
                <h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-white'>
                  No notifications yet
                </h3>
                <p className='mb-6 text-sm text-muted-foreground'>
                  When you have new activities, challenges, or recognitions,
                  they&apos;ll appear here.
                </p>
                <Button asChild>
                  <Link href='/dashboard'>Go to Dashboard</Link>
                </Button>
              </div>
            ) : (
              // Notifications list
              <ScrollArea className='h-[600px]'>
                <div className='space-y-3'>
                  {notifications.map(notification => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`
                        flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors
                        hover:bg-gray-50 focus:outline-none
                        focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:hover:bg-gray-800
                        ${
                          notification.read
                            ? 'bg-white dark:bg-gray-900'
                            : 'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20'
                        }
                      `}
                    >
                      {/* Icon or Avatar */}
                      <div className='mt-1'>
                        {notification.actor ? (
                          <Avatar className='h-10 w-10'>
                            <AvatarImage
                              src={notification.actor.profileImage}
                              alt={`${notification.actor.firstName} ${notification.actor.lastName}`}
                            />
                            <AvatarFallback>
                              {getInitials(
                                notification.actor.firstName,
                                notification.actor.lastName
                              )}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
                            <span className='text-lg'>
                              {NotificationService.getNotificationIcon(
                                notification.type
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-medium text-gray-900 dark:text-white'>
                          {notification.message}
                        </p>
                        <div className='mt-2 flex items-center gap-3'>
                          <span className='text-xs text-muted-foreground'>
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>
                          <Badge
                            variant='secondary'
                            className={cn(
                              'text-xs',
                              NotificationService.getNotificationColor(
                                notification.type
                              )
                            )}
                          >
                            {notification.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className='mt-2 h-3 w-3 rounded-full bg-primary-500' />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}

// Helper function for className concatenation
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
