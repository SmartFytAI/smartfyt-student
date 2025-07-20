'use client';

import { ReactNode } from 'react';

import { BottomNavigation } from '@/components/navigation/bottom-navigation';

import { PageHeader } from './page-header';

interface PageLayoutProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  showBottomNavigation?: boolean;
}

export function PageLayout({
  title,
  subtitle,
  children,
  showBottomNavigation = true,
}: PageLayoutProps) {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <PageHeader title={title} subtitle={subtitle} />
      <main className={showBottomNavigation ? 'pb-20' : ''}>{children}</main>
      {showBottomNavigation && <BottomNavigation />}
    </div>
  );
}
