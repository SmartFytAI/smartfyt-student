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
}

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
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
}: WidgetCardProps) {
  const colors =
    colorScheme === 'primary'
      ? 'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
      : 'text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300';

  return (
    <Card className={`h-full ${className}`}>
      {showHeader && (
        <CardHeader className='pb-3'>
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
      <CardContent className='space-y-3'>
        {loading && <LoadingSpinner color={colorScheme} />}
        {error && <ErrorMessage message={error} onRetry={onRetry} />}
        {!loading && !error && children}
      </CardContent>
    </Card>
  );
}
