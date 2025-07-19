'use client';

import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PWAInstaller } from '@/components/pwa-installer';
import { useAuth } from '@/hooks/use-auth';
import { logger } from '@/lib/logger';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    logger.debug('🏠 Dashboard auth effect:', {
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
        logger.debug('🔄 Dashboard: Auth not ready, retrying...', {
          retryCount,
        });
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        logger.debug(
          '🚫 Dashboard: User not authenticated after retries, redirecting to home'
        );
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, router, user, retryCount, isInitialLoad]);

  if (isLoading || isInitialLoad) {
    logger.debug('⏳ Dashboard: Showing loading state');
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    logger.debug('🚫 Dashboard: Not authenticated, will redirect');
    return null; // Will redirect to home
  }

  logger.debug('✅ Dashboard: Rendering for authenticated user', {
    userId: user.id,
  });

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* PWA Installer - only for authenticated users */}
      <PWAInstaller />

      {/* Header */}
      <div className='bg-white shadow-sm'>
        <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <Image
                  src='/logos/smartfyt-brain.png'
                  alt='SmartFyt Brain'
                  width={48}
                  height={48}
                  className='h-12 w-auto'
                />
              </div>
              <div className='ml-4'>
                <h1 className='text-xl font-semibold text-gray-900'>
                  Welcome back, {user.name}!
                </h1>
                <p className='text-sm text-gray-600'>
                  Ready to crush your goals today?
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <LogoutLink>Sign Out</LogoutLink>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Today's Workout */}
          <div className='rounded-lg bg-white p-6 shadow-sm'>
            <h3 className='mb-4 text-lg font-semibold'>Today&apos;s Workout</h3>
            <div className='py-8 text-center'>
              <div className='mb-2 text-4xl'>🏃‍♂️</div>
              <p className='text-gray-600'>No workout scheduled</p>
              <button className='mt-4 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
                Plan Workout
              </button>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className='rounded-lg bg-white p-6 shadow-sm'>
            <h3 className='mb-4 text-lg font-semibold'>Weekly Progress</h3>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span>Workouts</span>
                <span className='font-semibold'>0/5</span>
              </div>
              <div className='h-2 w-full rounded-full bg-gray-200'>
                <div
                  className='h-2 rounded-full bg-blue-600'
                  style={{ width: '0%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='rounded-lg bg-white p-6 shadow-sm'>
            <h3 className='mb-4 text-lg font-semibold'>Quick Actions</h3>
            <div className='space-y-3'>
              <button className='w-full rounded-md border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50'>
                📝 Log Workout
              </button>
              <button className='w-full rounded-md border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50'>
                📊 View Progress
              </button>
              <button className='w-full rounded-md border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50'>
                🎯 Set Goals
              </button>
            </div>
          </div>

          {/* Health Metrics */}
          <div className='rounded-lg bg-white p-6 shadow-sm'>
            <h3 className='mb-4 text-lg font-semibold'>Health Metrics</h3>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span>Sleep</span>
                <span className='font-semibold text-green-600'>8h</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Steps</span>
                <span className='font-semibold text-blue-600'>6,420</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Hydration</span>
                <span className='font-semibold text-purple-600'>64oz</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className='rounded-lg bg-white p-6 shadow-sm'>
            <h3 className='mb-4 text-lg font-semibold'>Recent Activity</h3>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100'>
                  <span className='text-sm text-green-600'>✓</span>
                </div>
                <div>
                  <p className='text-sm font-medium'>
                    Morning workout completed
                  </p>
                  <p className='text-xs text-gray-500'>2 hours ago</p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100'>
                  <span className='text-sm text-blue-600'>📝</span>
                </div>
                <div>
                  <p className='text-sm font-medium'>Journal entry logged</p>
                  <p className='text-xs text-gray-500'>Yesterday</p>
                </div>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className='rounded-lg bg-white p-6 shadow-sm'>
            <h3 className='mb-4 text-lg font-semibold'>Your Goals</h3>
            <div className='space-y-3'>
              <div className='rounded-md bg-blue-50 p-3'>
                <p className='text-sm font-medium text-blue-900'>
                  Improve 40-yard dash
                </p>
                <p className='text-xs text-blue-700'>Target: 4.8s</p>
              </div>
              <div className='rounded-md bg-green-50 p-3'>
                <p className='text-sm font-medium text-green-900'>
                  Maintain 3.5 GPA
                </p>
                <p className='text-xs text-green-700'>Current: 3.6</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
