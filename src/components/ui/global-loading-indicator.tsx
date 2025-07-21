'use client';

import { useEffect, useState } from 'react';

import { useLoading } from '@/lib/loading-manager';

interface GlobalLoadingIndicatorProps {
  className?: string;
}

export function GlobalLoadingIndicator({
  className = '',
}: GlobalLoadingIndicatorProps) {
  const { globalLoading, loadingCount } = useLoading();
  const [showIndicator, setShowIndicator] = useState(false);

  // Show indicator after a short delay to avoid flashing for quick operations
  useEffect(() => {
    if (globalLoading) {
      const timer = setTimeout(() => {
        setShowIndicator(true);
      }, 300); // 300ms delay

      return () => clearTimeout(timer);
    } else {
      setShowIndicator(false);
    }
  }, [globalLoading]);

  if (!showIndicator) {
    return null;
  }

  return (
    <div
      className={`fixed left-0 right-0 top-0 z-50 h-1 bg-gradient-to-r from-primary-500 to-primary-600 transition-opacity duration-300 ${
        globalLoading ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      <div className='h-full animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent' />

      {/* Optional: Show loading count for debugging */}
      {process.env.NODE_ENV === 'development' && loadingCount > 0 && (
        <div className='absolute right-2 top-2 rounded bg-black/80 px-2 py-1 text-xs text-white'>
          {loadingCount} loading
        </div>
      )}
    </div>
  );
}

/**
 * Component-specific loading indicator
 */
interface ComponentLoadingIndicatorProps {
  componentId: string;
  className?: string;
  showSpinner?: boolean;
}

export function ComponentLoadingIndicator({
  componentId,
  className = '',
  showSpinner = false,
}: ComponentLoadingIndicatorProps) {
  const { getLoadingState } = useLoading();
  const loadingState = getLoadingState(componentId);

  if (!loadingState?.isLoading) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      {showSpinner && (
        <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary-600' />
      )}
      {loadingState.message && (
        <span className='text-sm text-gray-600 dark:text-gray-400'>
          {loadingState.message}
        </span>
      )}
      {loadingState.progress !== undefined && (
        <div className='ml-2 h-1 w-16 rounded-full bg-gray-200'>
          <div
            className='h-1 rounded-full bg-primary-600 transition-all duration-300'
            style={{ width: `${loadingState.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
