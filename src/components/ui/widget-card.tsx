import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface WidgetCardProps {
  title: string;
  children: React.ReactNode;
  onViewAll?: () => void;
  viewAllText?: string;
  loading?: boolean;
  error?: string | null;
  className?: string;
  colorScheme?: 'primary' | 'secondary';
  showHeader?: boolean;
  onRetry?: () => void;
  showSkeleton?: boolean;
}

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

// Skeleton component for widget content
function WidgetSkeleton() {
  return (
    <div className='space-y-3'>
      {/* Quest/Item Skeletons */}
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className='flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700'
        >
          <div className='h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700'></div>
          <div className='min-w-0 flex-1 space-y-2'>
            <div className='h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
            <div className='h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
          </div>
          <div className='h-6 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700'></div>
        </div>
      ))}

      {/* Button Skeleton */}
      <div className='h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700'></div>
    </div>
  );
}

function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className='py-4 text-center'>
      <div className='mb-2 text-danger-600 dark:text-danger-400'>
        <svg
          className='mx-auto h-6 w-6'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
          />
        </svg>
      </div>
      <p className='mb-2 text-xs text-gray-600 dark:text-gray-400'>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className='text-xs text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300'
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function WidgetCard({
  title,
  children,
  onViewAll,
  viewAllText = 'View All →',
  loading = false,
  error = null,
  className = '',
  colorScheme = 'primary',
  showHeader = true,
  onRetry,
  showSkeleton = true,
}: WidgetCardProps) {
  const colors =
    colorScheme === 'primary'
      ? 'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
      : 'text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300';

  return (
    <Card className={`h-full ${className}`}>
      {showHeader && (
        <CardHeader className='pb-0'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold dark:text-white'>
              {title}
            </CardTitle>
            {onViewAll && (
              <button onClick={onViewAll} className={`text-sm ${colors}`}>
                {viewAllText}
              </button>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className='max-h-[calc(100%-4rem)] space-y-3 overflow-y-scroll px-6 pr-4 pt-0 [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:hover:bg-gray-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:hover:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5'>
        {loading && showSkeleton && <WidgetSkeleton />}
        {loading && !showSkeleton && <LoadingSpinner color={colorScheme} />}
        {error && <ErrorMessage message={error} onRetry={onRetry} />}
        {!loading && !error && children}
      </CardContent>
    </Card>
  );
}
