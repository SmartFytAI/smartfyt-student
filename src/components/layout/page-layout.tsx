'use client';

import { ReactNode } from 'react';

import { PageHeader } from './page-header';
import { PageNavigation } from './page-navigation';

interface PageLayoutProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backUrl?: string;
  showHomeButton?: boolean;
  onBack?: () => void;
  children: ReactNode;
}

export function PageLayout({
  title,
  subtitle,
  showBackButton = false,
  backUrl,
  showHomeButton = true,
  onBack,
  children,
}: PageLayoutProps) {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <PageHeader title={title} subtitle={subtitle} />
      <PageNavigation
        showBackButton={showBackButton}
        backUrl={backUrl}
        showHomeButton={showHomeButton}
        onBack={onBack}
      />
      {children}
    </div>
  );
}
