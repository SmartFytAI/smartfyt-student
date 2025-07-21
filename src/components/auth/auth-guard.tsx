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
  showSkeleton?: boolean;
}

// Skeleton loader component that mimics page structure
function PageSkeleton({ subtitle }: { title?: string; subtitle?: string }) {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      {/* Header Skeleton */}
      <header className='border-b border-gray-200 bg-white px-4 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
        <div className='mx-auto max-w-7xl'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700'></div>
              <div className='space-y-1'>
                <div className='h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                {subtitle && (
                  <div className='h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                )}
              </div>
            </div>
            <div className='h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700'></div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className='pb-20'>
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
      </main>

      {/* Bottom Navigation Skeleton */}
      <nav className='fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800'>
        <div className='flex items-center justify-around'>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className='flex flex-col items-center space-y-1'>
              <div className='h-6 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
              <div className='h-3 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function AuthGuard({
  children,
  fallback,
  redirectTo = '/',
  maxRetries = 3,
  retryDelay = 1000,
  initialLoadDelay = 300, // Reduced from 1000ms to 300ms
  showSkeleton = true,
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
