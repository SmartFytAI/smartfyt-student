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

// Mock data for notifications
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    message: 'Sarah challenged you to a step competition!',
    type: 'team_challenge',
    read: false,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    link: '/team-challenges',
    actorId: 'user-2',
    actor: {
      id: 'user-2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      profileImage: '/api/placeholder/32/32',
    },
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    message: 'Mike gave you a 🔥 for your workout today!',
    type: 'team_recognition',
    read: false,
    createdAt: '2024-01-15T09:15:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    link: '/team-challenges',
    actorId: 'user-3',
    actor: {
      id: 'user-3',
      firstName: 'Mike',
      lastName: 'Davis',
      profileImage: '/api/placeholder/32/32',
    },
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    message: 'Your coach left feedback on your journal entry',
    type: 'coach_feedback',
    read: true,
    createdAt: '2024-01-14T16:45:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
    link: '/journal',
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    message: 'New team quest available: Weekly Endurance Challenge',
    type: 'team_quest',
    read: false,
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z',
    link: '/team-challenges',
  },
  {
    id: 'notif-5',
    userId: 'user-1',
    message: 'Congratulations! You completed the Daily Steps Quest',
    type: 'quest_completed',
    read: true,
    createdAt: '2024-01-14T12:00:00Z',
    updatedAt: '2024-01-14T12:00:00Z',
    link: '/quests',
  },
];

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

      // Filter notifications for the user
      let filteredNotifications = mockNotifications.filter(
        n => n.userId === userId
      );

      // Filter by read status if requested
      if (options.onlyUnread) {
        filteredNotifications = filteredNotifications.filter(n => !n.read);
      }

      // Apply limit
      if (options.limit) {
        filteredNotifications = filteredNotifications.slice(0, options.limit);
      }

      // Sort by creation date (newest first)
      filteredNotifications.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return {
        success: true,
        data: filteredNotifications,
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

      const unreadCount = mockNotifications.filter(
        n => n.userId === userId && !n.read
      ).length;

      return {
        success: true,
        data: unreadCount,
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

      // In a real implementation, this would update the database
      // For mock data, we'll simulate the update
      const notification = mockNotifications.find(
        n => n.id === notificationId && n.userId === userId
      );

      if (!notification) {
        return {
          success: false,
          error: 'Notification not found',
        };
      }

      notification.read = true;
      notification.updatedAt = new Date().toISOString();

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

      const userNotifications = mockNotifications.filter(
        n => n.userId === userId && !n.read
      );
      const count = userNotifications.length;

      // Mark all as read
      userNotifications.forEach(n => {
        n.read = true;
        n.updatedAt = new Date().toISOString();
      });

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
      mockNotifications.push(newNotification);

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
