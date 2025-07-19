'use client';

import { useEffect, useState } from 'react';

import { pwaLogger } from '@/lib/logger';

export function PWAInstaller() {
  const [_isOnline, setIsOnline] = useState(true);
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          pwaLogger.info(
            'Service worker registered successfully:',
            registration
          );
          setSwRegistration(registration);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New content is available
                  if (confirm('New version available! Refresh to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch(error => {
          pwaLogger.error('Service worker registration failed:', error);
        });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'SYNC_COMPLETE') {
          pwaLogger.debug('Background sync completed:', event.data.message);
        }
      });
    }

    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      pwaLogger.info('App is back online');

      // Trigger background sync if service worker is available
      if (swRegistration && 'serviceWorker' in navigator) {
        // Background sync will be handled by the service worker
        pwaLogger.debug(
          'Connection restored - service worker will handle sync'
        );
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      pwaLogger.warn('App is offline');
    };

    // Set initial state
    setIsOnline(navigator.onLine);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [swRegistration]);

  // Don't render anything - this is just for functionality
  return null;
}

// Connection status hook for use in other components
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
