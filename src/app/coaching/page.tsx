'use client';

import { AuthGuard } from '@/components/auth';
import { PageLayout } from '@/components/layout/page-layout';

export default function CoachingPage() {
  return (
    <AuthGuard>
      <PageLayout
        title='Coach'
        subtitle='Get personalized guidance and feedback'
      >
        <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <div className='mx-auto mb-4 h-12 w-12 text-gray-400'>
              <svg
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-12 w-12'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z'
                />
              </svg>
            </div>
            <h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-white'>
              Coach Interface Coming Soon
            </h3>
            <p className='mb-6 text-gray-500 dark:text-gray-400'>
              Connect with your AI coach for personalized guidance, feedback,
              and support.
            </p>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
                <div className='mb-2 text-secondary-600 dark:text-secondary-400'>
                  <svg
                    className='h-8 w-8'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z'
                    />
                  </svg>
                </div>
                <h4 className='mb-1 font-medium text-gray-900 dark:text-white'>
                  AI Chat
                </h4>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Get instant answers and guidance from your AI coach
                </p>
              </div>

              <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
                <div className='mb-2 text-success-600 dark:text-success-400'>
                  <svg
                    className='h-8 w-8'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z'
                    />
                  </svg>
                </div>
                <h4 className='mb-1 font-medium text-gray-900 dark:text-white'>
                  Progress Reviews
                </h4>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Weekly and monthly assessments of your performance
                </p>
              </div>

              <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
                <div className='mb-2 text-primary-600 dark:text-primary-400'>
                  <svg
                    className='h-8 w-8'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z'
                    />
                  </svg>
                </div>
                <h4 className='mb-1 font-medium text-gray-900 dark:text-white'>
                  Goal Check-ins
                </h4>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Regular goal review sessions and adjustments
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
