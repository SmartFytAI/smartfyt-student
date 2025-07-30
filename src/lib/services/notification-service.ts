import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';

// Types for notifications
export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  link?: string;
  actorId?: string;
  actor?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

export type NotificationType =
  | 'team_challenge'
  | 'team_recognition'
  | 'quest_completed'
  | 'coach_feedback'
  | 'team_quest'
  | 'general';

export interface NotificationServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateNotificationData {
  userId: string;
  message: string;
  type: NotificationType;
  link?: string;
  actorId?: string;
}

export class NotificationService {
  /**
   * Get user notifications
   */
  static async getUserNotifications(
    userId: string,
    options: { limit?: number; onlyUnread?: boolean } = {}
  ): Promise<NotificationServiceResponse<Notification[]>> {
    try {
      logger.debug('Getting user notifications', { userId, options });

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (options.onlyUnread) {
        queryParams.append('onlyUnread', 'true');
      }
      if (options.limit) {
        queryParams.append('limit', options.limit.toString());
      }

      const response = await apiClient.getUserNotifications(
        userId,
        queryParams.toString()
      );

      if (response.error) {
        return {
          success: false,
          error: response.error,
        };
      }

      const notifications = (response.data as any)?.notifications || [];
      return {
        success: true,
        data: notifications as Notification[],
      };
    } catch (error) {
      logger.error('Failed to get user notifications', { userId, error });
      return {
        success: false,
        error: 'Failed to fetch notifications',
      };
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(
    userId: string
  ): Promise<NotificationServiceResponse<number>> {
    try {
      logger.debug('Getting unread notification count', { userId });

      const response = await apiClient.getUnreadNotificationCount(userId);

      if (response.error) {
        return {
          success: false,
          error: response.error,
          data: 0,
        };
      }

      const count = (response.data as any)?.count || 0;
      return {
        success: true,
        data: count,
      };
    } catch (error) {
      logger.error('Failed to get unread count', { userId, error });
      return {
        success: false,
        error: 'Failed to fetch unread count',
        data: 0,
      };
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(
    userId: string,
    notificationId: string
  ): Promise<NotificationServiceResponse<void>> {
    try {
      logger.debug('Marking notification as read', { userId, notificationId });

      const response = await apiClient.markNotificationAsRead(
        userId,
        notificationId
      );

      if (response.error) {
        return {
          success: false,
          error: response.error,
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      logger.error('Failed to mark notification as read', {
        userId,
        notificationId,
        error,
      });
      return {
        success: false,
        error: 'Failed to mark notification as read',
      };
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(
    userId: string
  ): Promise<NotificationServiceResponse<number>> {
    try {
      logger.debug('Marking all notifications as read', { userId });

      const response = await apiClient.markAllNotificationsAsRead(userId);

      if (response.error) {
        return {
          success: false,
          error: response.error,
          data: 0,
        };
      }

      const count = (response.data as any)?.count || 0;
      return {
        success: true,
        data: count,
      };
    } catch (error) {
      logger.error('Failed to mark all notifications as read', {
        userId,
        error,
      });
      return {
        success: false,
        error: 'Failed to mark all notifications as read',
        data: 0,
      };
    }
  }

  /**
   * Create a new notification
   */
  static async createNotification(
    data: CreateNotificationData
  ): Promise<NotificationServiceResponse<Notification>> {
    try {
      logger.debug('Creating notification', { data });

      const newNotification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: data.userId,
        message: data.message,
        type: data.type,
        read: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        link: data.link,
        actorId: data.actorId,
      };

      // In a real implementation, this would save to the database
      // For mock data, we'll simulate the update
      // mockNotifications.push(newNotification); // This line is removed as per the new_code

      return {
        success: true,
        data: newNotification,
      };
    } catch (error) {
      logger.error('Failed to create notification', { data, error });
      return {
        success: false,
        error: 'Failed to create notification',
      };
    }
  }

  /**
   * Get notification icon based on type
   */
  static getNotificationIcon(type: NotificationType) {
    switch (type) {
      case 'team_challenge':
        return '🏆';
      case 'team_recognition':
        return '👏';
      case 'quest_completed':
        return '✅';
      case 'coach_feedback':
        return '💬';
      case 'team_quest':
        return '🎯';
      case 'general':
      default:
        return '🔔';
    }
  }

  /**
   * Get notification color based on type
   */
  static getNotificationColor(type: NotificationType) {
    switch (type) {
      case 'team_challenge':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'team_recognition':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'quest_completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'coach_feedback':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'team_quest':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'general':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }
}
