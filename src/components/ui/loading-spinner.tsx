import { getLoadingSpinnerColor } from '@/lib/theme-utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  text = 'Loading...',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const colorClasses = getLoadingSpinnerColor(color);

  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <div className='text-center'>
        <div
          className={`mx-auto ${sizeClasses[size]} animate-spin rounded-full border-b-2 ${colorClasses}`}
        ></div>
        {text && (
          <p className='mt-2 text-xs text-gray-600 dark:text-gray-400'>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
