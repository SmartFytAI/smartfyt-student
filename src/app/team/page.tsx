'use client';

import { PageLayout } from '@/components/layout/page-layout';

export default function TeamPage() {
  return (
    <PageLayout
      title='Team'
      subtitle='Connect with your teammates and compete together'
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
                d='M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
              />
            </svg>
          </div>
          <h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-white'>
            Team Features Coming Soon
          </h3>
          <p className='mb-6 text-gray-500 dark:text-gray-400'>
            Build team spirit, compete together, and achieve your goals as a
            team.
          </p>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-2 text-orange-600 dark:text-orange-400'>
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
                    d='M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0'
                  />
                </svg>
              </div>
              <h4 className='mb-1 font-medium text-gray-900 dark:text-white'>
                Leaderboard
              </h4>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Compete with teammates and track your rankings
              </p>
            </div>

            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-2 text-blue-600 dark:text-blue-400'>
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
                Team Chat
              </h4>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Stay connected with your teammates
              </p>
            </div>

            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-2 text-green-600 dark:text-green-400'>
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
                    d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5'
                  />
                </svg>
              </div>
              <h4 className='mb-1 font-medium text-gray-900 dark:text-white'>
                Team Calendar
              </h4>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Shared events, practices, and games
              </p>
            </div>

            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-2 text-purple-600 dark:text-purple-400'>
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
                Team Challenges
              </h4>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Compete in team quests and competitions
              </p>
            </div>

            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-2 text-red-600 dark:text-red-400'>
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
                Team Stats
              </h4>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Collective performance metrics and insights
              </p>
            </div>

            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-2 text-yellow-600 dark:text-yellow-400'>
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
                    d='M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z'
                  />
                </svg>
              </div>
              <h4 className='mb-1 font-medium text-gray-900 dark:text-white'>
                Team Achievements
              </h4>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Celebrate team milestones and accomplishments
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
