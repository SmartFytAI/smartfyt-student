'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import {
  useUnreadNotificationCount,
  useUserNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useCreateNotification,
} from '@/hooks/use-notifications-api';
import { logger } from '@/lib/logger';
import type {
  Notification,
  NotificationType,
} from '@/lib/services/notification-service';

interface NotificationContextType {
  // Data
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (data: {
    message: string;
    type: NotificationType;
    link?: string;
    actorId?: string;
  }) => Promise<void>;

  // State
  hasUnreadNotifications: boolean;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Get notifications data
  const {
    data: notificationsResponse,
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refreshNotifications,
  } = useUserNotifications(user?.id || null, { limit: 50 });

  const {
    data: unreadCountResponse,
    isLoading: unreadCountLoading,
    error: unreadCountError,
  } = useUnreadNotificationCount(user?.id || null);

  // Mutations
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const createNotificationMutation = useCreateNotification();

  // Extract data
  const notifications = notificationsResponse?.data || [];
  const unreadCount = unreadCountResponse?.data || 0;
  const isLoading = notificationsLoading || unreadCountLoading;
  const hasUnreadNotifications = unreadCount > 0;

  // Handle errors
  useEffect(() => {
    const currentError = notificationsError || unreadCountError;
    if (currentError) {
      setError(currentError.message || 'Failed to load notifications');
      logger.error('Notification provider error:', currentError);
    } else {
      setError(null);
    }
  }, [notificationsError, unreadCountError]);

  // Actions
  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const result = await markAsReadMutation.mutateAsync({
        userId: user.id,
        notificationId,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to mark notification as read');
      }

      logger.debug('Notification marked as read:', { notificationId });
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const result = await markAllAsReadMutation.mutateAsync(user.id);

      if (!result.success) {
        throw new Error(
          result.error || 'Failed to mark all notifications as read'
        );
      }

      logger.debug('All notifications marked as read:', { count: result.data });
    } catch (error) {
      logger.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  };

  const createNotification = async (data: {
    message: string;
    type: NotificationType;
    link?: string;
    actorId?: string;
  }) => {
    if (!user?.id) return;

    try {
      const result = await createNotificationMutation.mutateAsync({
        userId: user.id,
        ...data,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create notification');
      }

      logger.debug('Notification created:', {
        notificationId: result.data?.id,
      });
    } catch (error) {
      logger.error('Failed to create notification:', error);
      throw error;
    }
  };

  const contextValue: NotificationContextType = {
    // Data
    notifications,
    unreadCount,
    isLoading,
    error,

    // Actions
    markAsRead,
    markAllAsRead,
    createNotification,

    // State
    hasUnreadNotifications,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use the notification context
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
}
