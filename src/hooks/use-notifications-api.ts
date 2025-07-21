import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  NotificationService,
  type CreateNotificationData,
} from '@/lib/services/notification-service';

// Query keys
export const notificationQueryKeys = {
  userNotifications: (
    userId: string,
    options?: { limit?: number; onlyUnread?: boolean }
  ) => ['notifications', 'user', userId, options],
  unreadCount: (userId: string) => ['notifications', 'unread-count', userId],
};

/**
 * Hook to get user notifications
 */
export function useUserNotifications(
  userId: string | null,
  options: { limit?: number; onlyUnread?: boolean } = {}
) {
  return useQuery({
    queryKey: notificationQueryKeys.userNotifications(userId || '', options),
    queryFn: () =>
      NotificationService.getUserNotifications(userId || '', options),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get unread notification count
 */
export function useUnreadNotificationCount(userId: string | null) {
  return useQuery({
    queryKey: notificationQueryKeys.unreadCount(userId || ''),
    queryFn: () => NotificationService.getUnreadCount(userId || ''),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute - more frequent updates
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      notificationId,
    }: {
      userId: string;
      notificationId: string;
    }) => NotificationService.markAsRead(userId, notificationId),
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: notificationQueryKeys.userNotifications(variables.userId),
        });
        queryClient.invalidateQueries({
          queryKey: notificationQueryKeys.unreadCount(variables.userId),
        });
      }
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => NotificationService.markAllAsRead(userId),
    onSuccess: (data, userId) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: notificationQueryKeys.userNotifications(userId),
        });
        queryClient.invalidateQueries({
          queryKey: notificationQueryKeys.unreadCount(userId),
        });
      }
    },
  });
}

/**
 * Hook to create a new notification
 */
export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNotificationData) =>
      NotificationService.createNotification(data),
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: notificationQueryKeys.userNotifications(variables.userId),
        });
        queryClient.invalidateQueries({
          queryKey: notificationQueryKeys.unreadCount(variables.userId),
        });
      }
    },
  });
}

/**
 * Hook to invalidate notification queries
 */
export function useInvalidateNotificationQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateUserNotifications: (userId: string) => {
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.userNotifications(userId),
      });
    },
    invalidateUnreadCount: (userId: string) => {
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.unreadCount(userId),
      });
    },
    invalidateAll: (userId: string) => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'user', userId],
      });
    },
  };
}
