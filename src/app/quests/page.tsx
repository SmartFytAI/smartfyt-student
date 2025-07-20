'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PageLayout } from '@/components/layout/page-layout';
import { QuestPage } from '@/components/quest';
import { useAuth } from '@/hooks/use-auth';
import { logger } from '@/lib/logger';

export default function QuestsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    logger.debug('⚔️ Quests page auth effect:', {
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
      }, 1000); // Wait 1 second on initial load
      return () => clearTimeout(timer);
    }

    if (!isLoading && !isAuthenticated && !isInitialLoad) {
      // If we've retried a few times and still no auth, redirect
      if (retryCount < 3) {
        logger.debug('🔄 Quests page: Auth not ready, retrying...', {
          retryCount,
        });
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        logger.debug(
          '🚫 Quests page: User not authenticated after retries, redirecting to home'
        );
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, router, user, retryCount, isInitialLoad]);

  if (isLoading || isInitialLoad) {
    logger.debug('⏳ Quests page: Showing loading state');
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600 dark:text-gray-400'>
            Loading quests...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    logger.debug('🚫 Quests page: Not authenticated, will redirect');
    return null; // Will redirect to home
  }

  logger.debug('✅ Quests page: Rendering for authenticated user', {
    userId: user.id,
  });

  return (
    <PageLayout
      title='Your Quests'
      subtitle='Complete challenges to earn points and level up!'
    >
      {/* Quests Content */}
      <QuestPage userId={user.id} />
    </PageLayout>
  );
}
