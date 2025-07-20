/**
 * Cache management utilities for SmartFyt Student app
 * Helps prevent stale styles and cached content issues
 */

import { logger } from '@/lib/logger';

// Clear all caches (useful for development and debugging)
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      logger.info('🗂️ All caches cleared');
    } catch (error) {
      logger.error('❌ Failed to clear caches:', error);
    }
  }
}

// Clear specific cache by name
export async function clearCacheByName(cacheName: string): Promise<void> {
  if ('caches' in window) {
    try {
      await caches.delete(cacheName);
      logger.info(`🗂️ Cache '${cacheName}' cleared`);
    } catch (error) {
      logger.error(`❌ Failed to clear cache '${cacheName}':`, error);
    }
  }
}

// Clear CSS-related caches
export async function clearCSSCaches(): Promise<void> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      const cssCaches = cacheNames.filter(
        name =>
          name.includes('css') ||
          name.includes('static') ||
          name.includes('smartfyt-student')
      );

      await Promise.all(cssCaches.map(cacheName => caches.delete(cacheName)));
      logger.info('🗂️ CSS caches cleared');
    } catch (error) {
      logger.error('❌ Failed to clear CSS caches:', error);
    }
  }
}

// Force reload and clear caches
export async function forceReloadAndClearCaches(): Promise<void> {
  await clearAllCaches();

  // Unregister service worker to force fresh load
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      logger.info('🗂️ Service workers unregistered');
    } catch (error) {
      logger.error('❌ Failed to unregister service workers:', error);
    }
  }

  // Force page reload
  window.location.reload();
}

// Check if we're in development mode
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

// Development-only cache clearing
export async function devClearCaches(): Promise<void> {
  if (isDevelopment()) {
    logger.info('🗂️ Development mode - clearing caches');
    await clearAllCaches();
  }
}

// Handle logout cache clearing
export async function handleLogoutCacheClear(): Promise<void> {
  try {
    // Clear CSS caches to prevent stale styles
    await clearCSSCaches();

    // Clear any auth-related caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const authCaches = cacheNames.filter(
        name => name.includes('api') || name.includes('auth')
      );

      await Promise.all(authCaches.map(cacheName => caches.delete(cacheName)));
    }

    logger.info('🗂️ Logout cache clearing completed');
  } catch (error) {
    logger.error('❌ Failed to clear caches on logout:', error);
  }
}
