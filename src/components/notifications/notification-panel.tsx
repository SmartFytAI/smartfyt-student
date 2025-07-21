'use client';

import { formatDistanceToNow } from 'date-fns';
import { CheckCheck, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationService } from '@/lib/services/notification-service';

import { useNotifications } from './notification-provider';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead, isLoading } =
    useNotifications();
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

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

      // Close the panel
      onClose();
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAllRead(true);
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle>Notifications</DialogTitle>
            <Button
              variant='ghost'
              size='sm'
              onClick={onClose}
              className='h-8 w-8 p-0'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Header with mark all read button */}
          {unreadCount > 0 && (
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </span>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllRead}
                className='h-8 px-2 text-xs'
              >
                <CheckCheck className='mr-1 h-3 w-3' />
                Mark all read
              </Button>
            </div>
          )}

          {/* Notifications list */}
          <ScrollArea className='h-[400px]'>
            {isLoading ? (
              <div className='space-y-3'>
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className='flex items-start gap-3 rounded-lg border p-3'
                  >
                    <div className='h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700' />
                    <div className='flex-1 space-y-2'>
                      <div className='h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
                      <div className='h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-8 text-center'>
                <div className='mb-2 text-4xl'>🔔</div>
                <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  No notifications
                </p>
                <p className='text-xs text-muted-foreground'>
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              <div className='space-y-2'>
                {notifications.map(notification => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors
                      hover:bg-gray-50 focus:outline-none
                      focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:hover:bg-gray-800
                      ${
                        notification.read
                          ? 'bg-white dark:bg-gray-900'
                          : 'bg-primary-50 dark:bg-primary-900/20'
                      }
                    `}
                  >
                    {/* Icon or Avatar */}
                    <div className='mt-1'>
                      {notification.actor ? (
                        <Avatar className='h-8 w-8'>
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
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
                          <span className='text-sm'>
                            {NotificationService.getNotificationIcon(
                              notification.type
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm text-gray-900 dark:text-gray-100'>
                        {notification.message}
                      </p>
                      <div className='mt-1 flex items-center gap-2'>
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
                      <div className='h-2 w-2 rounded-full bg-primary-500' />
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className='border-t pt-4'>
              <Button variant='outline' size='sm' className='w-full' asChild>
                <Link href='/notifications' onClick={onClose}>
                  View all notifications
                </Link>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function for className concatenation
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
