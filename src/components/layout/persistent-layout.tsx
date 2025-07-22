'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';

import { CardErrorBoundary } from '@/components/error/error-boundary';
import { PageHeader } from '@/components/layout/page-header';
import { BottomNavigation } from '@/components/navigation/bottom-navigation';
import { logger } from '@/lib/logger';

interface PersistentLayoutProps {
  children: ReactNode;
  showBottomNavigation?: boolean;
  title?: string;
  subtitle?: string;
}

interface PageMetadata {
  title?: string;
  subtitle?: string;
}

// Page metadata configuration
const PAGE_METADATA: Record<string, PageMetadata> = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Track your progress and goals',
  },
  '/journal': {
    title: 'Journal',
    subtitle: 'Reflect on your day',
  },
  '/quests': {
    title: 'Quests',
    subtitle: 'Complete challenges and earn points',
  },
  '/team': {
    title: 'Team',
    subtitle: 'Connect with your teammates',
  },
  '/coaching': {
    title: 'Coaching',
    subtitle: 'Get feedback from your coach',
  },
  '/notifications': {
    title: 'Notifications',
    subtitle: 'Stay updated',
  },
  '/profile': {
    title: 'Profile',
    subtitle: 'Manage your account',
  },
};

export function PersistentLayout({
  children,
  showBottomNavigation = true,
  title,
  subtitle,
}: PersistentLayoutProps) {
  const pathname = usePathname();
  const [currentTitle, setCurrentTitle] = useState<string | undefined>(title);
  const [currentSubtitle, setCurrentSubtitle] = useState<string | undefined>(
    subtitle
  );
  const [isNavigating, setIsNavigating] = useState(false);

  // Update page metadata when pathname changes
  useEffect(() => {
    logger.debug('🔄 PersistentLayout: Pathname changed', { pathname });

    // Set navigation state
    setIsNavigating(true);

    // Update metadata based on route
    const pageMetadata = PAGE_METADATA[pathname] || {};
    const newTitle = title || pageMetadata.title;
    const newSubtitle = subtitle || pageMetadata.subtitle;

    // Use a small delay to show navigation transition
    const timer = setTimeout(() => {
      setCurrentTitle(newTitle);
      setCurrentSubtitle(newSubtitle);
      setIsNavigating(false);
    }, 50); // Minimal delay for smooth transition

    return () => clearTimeout(timer);
  }, [pathname, title, subtitle]);

  return (
    <CardErrorBoundary name='PersistentLayout'>
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
        {/* Persistent Header */}
        <PageHeader
          title={currentTitle}
          subtitle={currentSubtitle}
          className={
            isNavigating ? 'opacity-75 transition-opacity duration-150' : ''
          }
        />

        {/* Main Content */}
        <main
          className={`${showBottomNavigation ? 'pb-20' : ''} ${
            isNavigating ? 'opacity-90 transition-opacity duration-150' : ''
          }`}
        >
          {children}
        </main>

        {/* Persistent Bottom Navigation */}
        {showBottomNavigation && (
          <BottomNavigation
            className={
              isNavigating ? 'opacity-75 transition-opacity duration-150' : ''
            }
          />
        )}
      </div>
    </CardErrorBoundary>
  );
}

// Enhanced PageHeader component with transition support
interface EnhancedPageHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function EnhancedPageHeader({
  title,
  subtitle,
  className = '',
}: EnhancedPageHeaderProps) {
  return (
    <header
      className={`border-b border-gray-200 bg-white px-4 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      <div className='mx-auto max-w-7xl'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='h-8 w-8 rounded-full bg-gradient-to-br from-athletic-orange to-athletic-orange/80'></div>
            <div className='space-y-1'>
              {title && (
                <h1 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className='h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700'></div>
        </div>
      </div>
    </header>
  );
}
