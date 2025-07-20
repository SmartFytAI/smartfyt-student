'use client';

import { ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

interface PageNavigationProps {
  showBackButton?: boolean;
  backUrl?: string;
  showHomeButton?: boolean;
  onBack?: () => void;
}

export function PageNavigation({
  showBackButton = false,
  backUrl,
  showHomeButton = true,
  onBack,
}: PageNavigationProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  const handleHome = () => {
    router.push('/dashboard');
  };

  // Don't render if no navigation buttons are needed
  if (!showBackButton && !showHomeButton) {
    return null;
  }

  return (
    <div className='border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900'>
      <div className='mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-3'>
          {showBackButton && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleBack}
              className='flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            >
              <ArrowLeft className='h-4 w-4' />
              Back
            </Button>
          )}

          {showHomeButton && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleHome}
              className='flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            >
              <Home className='h-4 w-4' />
              Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
