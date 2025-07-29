'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

import { PersistentLayout } from '@/components/layout';
import { useAuth } from '@/hooks/use-auth';
import { logger } from '@/lib/logger';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  maxRetries?: number;
  retryDelay?: number;
  initialLoadDelay?: number;
  showSkeleton?: boolean;
}

// Skeleton loader component that uses PersistentLayout
function PageSkeleton({ subtitle }: { title?: string; subtitle?: string }) {
  return (
    <PersistentLayout title='Loading...' subtitle={subtitle}>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='space-y-6'>
          {/* Card Skeletons */}
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'
            >
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                  <div className='h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                </div>
                <div className='space-y-2'>
                  <div className='h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                  <div className='h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                  <div className='h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PersistentLayout>
  );
}

export function AuthGuard({
  children,
  fallback,
  redirectTo = '/',
  maxRetries = 3,
  retryDelay = 1000,
  initialLoadDelay = 500, // Increased from 300ms to 500ms for more stability
  showSkeleton = true,
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    logger.debug('🔐 AuthGuard: Auth state changed', {
      isLoading,
      isAuthenticated,
      hasUser: !!user,
      userId: user?.id,
      retryCount,
      isInitialLoad,
      shouldRedirect,
    });

    // Give some time for auth to initialize on first load
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, initialLoadDelay);
      return () => clearTimeout(timer);
    }

    // If we're still loading, don't make any decisions yet
    if (isLoading) {
      return;
    }

    // If we have a user and are authenticated, we're good
    if (isAuthenticated && user) {
      setShouldRedirect(false);
      return;
    }

    // If we're not loading and not authenticated, handle retry logic
    if (!isAuthenticated || !user) {
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
          `🚫 AuthGuard: User not authenticated after ${maxRetries} retries, will redirect to ${redirectTo}`
        );
        setShouldRedirect(true);
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
    shouldRedirect,
  ]);

  // Show skeleton loading state while auth is initializing
  if ((isLoading || isInitialLoad) && showSkeleton) {
    logger.debug('⏳ AuthGuard: Showing skeleton loading state');
    return <PageSkeleton />;
  }

  // Show fallback loading state if skeleton is disabled
  if (isLoading || isInitialLoad) {
    logger.debug('⏳ AuthGuard: Showing fallback loading state');
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

  // Don't render children if not authenticated or if we should redirect
  if (!isAuthenticated || !user || shouldRedirect) {
    logger.debug('🚫 AuthGuard: Not authenticated or should redirect, not rendering children');
    return null;
  }

  logger.debug('✅ AuthGuard: Rendering for authenticated user', {
    userId: user.id,
  });

  return <>{children}</>;
}
