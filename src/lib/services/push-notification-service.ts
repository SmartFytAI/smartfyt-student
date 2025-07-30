import { logger } from '@/lib/logger';

export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isSupported = 'serviceWorker' in navigator && 'PushManager' in window;

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      logger.warn('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      logger.info('Service Worker registered');

      // Request notification permission
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        logger.warn('Notification permission denied');
        return false;
      }

      // Subscribe to push notifications
      await this.subscribeToPush();
      return true;
    } catch (error) {
      logger.error('Failed to initialize push notifications', error);
      return false;
    }
  }

  /**
   * Request notification permission
   */
  private async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    return await Notification.requestPermission();
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribeToPush(): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ),
      });

      // Send subscription to backend
      await this.sendSubscriptionToServer(subscription);
      logger.info('Push subscription created');
    } catch (error) {
      logger.error('Failed to subscribe to push notifications', error);
      throw error;
    }
  }

  /**
   * Send subscription to backend
   */
  private async sendSubscriptionToServer(
    subscription: PushSubscription
  ): Promise<void> {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userId: await this.getCurrentUserId(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }
  }

  /**
   * Get current user ID (implement based on your auth system)
   */
  private async getCurrentUserId(): Promise<string | null> {
    // This should be implemented based on your auth system
    // For now, we'll return null and handle it in the backend
    return null;
  }

  /**
   * Convert VAPID public key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Show local notification
   */
  async showNotification(data: PushNotificationData): Promise<void> {
    if (!this.swRegistration) {
      logger.warn(
        'Service Worker not registered, showing fallback notification'
      );
      this.showFallbackNotification(data);
      return;
    }

    try {
      await this.swRegistration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/icons/notification-icon.png',
        badge: data.badge || '/icons/badge-icon.png',
        tag: data.tag,
        data: data.data,
        requireInteraction: false,
        silent: false,
      });
    } catch (error) {
      logger.error('Failed to show notification', error);
      this.showFallbackNotification(data);
    }
  }

  /**
   * Fallback notification for when Service Worker is not available
   */
  private showFallbackNotification(data: PushNotificationData): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/icons/notification-icon.png',
        tag: data.tag,
        data: data.data,
      });
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<void> {
    if (!this.swRegistration) {
      return;
    }

    try {
      const subscription =
        await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer(subscription);
        logger.info('Push subscription removed');
      }
    } catch (error) {
      logger.error('Failed to unsubscribe from push notifications', error);
    }
  }

  /**
   * Remove subscription from backend
   */
  private async removeSubscriptionFromServer(
    subscription: PushSubscription
  ): Promise<void> {
    const response = await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userId: await this.getCurrentUserId(),
      }),
    });

    if (!response.ok) {
      logger.warn('Failed to remove subscription from server');
    }
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
