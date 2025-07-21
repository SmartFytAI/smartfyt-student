'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { logger } from '@/lib/logger';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  maxRetries?: number;
  retryDelay?: number;
  initialLoadDelay?: number;
}

export function AuthGuard({
  children,
  fallback,
  redirectTo = '/',
  maxRetries = 3,
  retryDelay = 1000,
  initialLoadDelay = 1000,
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    logger.debug('🔐 AuthGuard: Auth state changed', {
      isLoading,
      isAuthenticated,
      hasUser: !!user,
      userId: user?.id,
      retryCount,
      isInitialLoad,
    });

    // Give some time for auth to initialize on first load
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, initialLoadDelay);
      return () => clearTimeout(timer);
    }

    if (!isLoading && !isAuthenticated && !isInitialLoad) {
      // If we've retried a few times and still no auth, redirect
      if (retryCount < maxRetries) {
        logger.debug('🔄 AuthGuard: Auth not ready, retrying...', {
          retryCount,
          maxRetries,
        });
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, retryDelay);
        return () => clearTimeout(timer);
      } else {
        logger.debug(
          `🚫 AuthGuard: User not authenticated after ${maxRetries} retries, redirecting to ${redirectTo}`
        );
        router.push(redirectTo);
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    router,
    user,
    retryCount,
    isInitialLoad,
    maxRetries,
    retryDelay,
    initialLoadDelay,
    redirectTo,
  ]);

  // Show loading state while auth is initializing
  if (isLoading || isInitialLoad) {
    logger.debug('⏳ AuthGuard: Showing loading state');
    return (
      fallback || (
        <div className='flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900'>
          <div className='text-center'>
            <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-secondary-600'></div>
            <p className='mt-4 text-gray-600 dark:text-gray-400'>Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    logger.debug('🚫 AuthGuard: Not authenticated, will redirect');
    return null;
  }

  logger.debug('✅ AuthGuard: Rendering for authenticated user', {
    userId: user.id,
  });

  return <>{children}</>;
}
