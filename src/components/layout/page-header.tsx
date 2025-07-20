'use client';

import Image from 'next/image';

import { UserAvatar } from '@/components/user-avatar';
import { useAuth } from '@/hooks/use-auth';
import { logger } from '@/lib/logger';
interface PageHeaderProps {
  title?: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const { user } = useAuth();

  const handleLogout = async () => {
    // Cache clearing is now handled in UserAvatar component
    logger.debug('🚪 Logout handled by UserAvatar component');
  };

  return (
    <div className='bg-white shadow-sm dark:bg-gray-800 dark:shadow-gray-900/20'>
      <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between'>
          {/* Logo and Title */}
          <div className='flex items-center gap-4'>
            <div className='flex-shrink-0'>
              <Image
                src='/logos/smartfyt-brain.png'
                alt='SmartFyt Brain'
                width={48}
                height={48}
                className='h-12 w-auto'
              />
            </div>
            {(title || subtitle) && (
              <div>
                {title && (
                  <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* User Controls */}
          <div className='flex items-center gap-3'>
            <UserAvatar userId={user?.id || ''} onSignOut={handleLogout} />
          </div>
        </div>
      </div>
    </div>
  );
}
