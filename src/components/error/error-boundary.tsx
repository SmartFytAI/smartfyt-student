'use client';

import React, { Component, ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'card' | 'page' | 'app';
  name?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // In production, you would send this to your error reporting service
    // Example: Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { level = 'card', name, fallback } = this.props;

      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Card-level error boundary
      if (level === 'card') {
        return (
          <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-center'>
            <div className='mb-3'>
              <span className='text-2xl'>⚠️</span>
            </div>
            <h3 className='mb-2 text-sm font-medium text-red-800'>
              {name ? `${name} Error` : 'Card Error'}
            </h3>
            <p className='mb-3 text-xs text-red-600'>
              Something went wrong loading this content.
            </p>
            <div className='flex flex-col gap-2'>
              <Button
                size='sm'
                variant='destructive'
                onClick={this.handleRetry}
                className='cursor-pointer'
              >
                Try Again
              </Button>
              {process.env.NODE_ENV === 'development' && (
                <Badge variant='destructive' className='text-xs'>
                  Dev: {this.state.error?.message}
                </Badge>
              )}
            </div>
          </div>
        );
      }

      // Page-level error boundary
      if (level === 'page') {
        return (
          <div className='min-h-screen-mobile flex items-center justify-center p-4'>
            <div className='w-full max-w-md rounded-lg border border-red-200 bg-white'>
              <div className='p-8 text-center'>
                <div className='mb-6'>
                  <span className='text-6xl'>🏃‍♂️💥</span>
                </div>
                <h2 className='mb-2 text-xl font-bold text-gray-900'>
                  Something went wrong
                </h2>
                <p className='mb-6 text-gray-600'>
                  We&apos;re sorry, but something unexpected happened. Our team
                  has been notified.
                </p>
                <div className='space-y-3'>
                  <Button
                    variant='default'
                    onClick={this.handleRetry}
                    className='w-full cursor-pointer'
                  >
                    Try Again
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => (window.location.href = '/')}
                    className='w-full cursor-pointer'
                  >
                    Go Home
                  </Button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <details className='mt-6 text-left'>
                    <summary className='cursor-pointer text-sm text-gray-500 hover:text-gray-700'>
                      Debug Info (Dev Only)
                    </summary>
                    <pre className='mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs'>
                      {this.state.error?.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        );
      }

      // App-level error boundary (most critical)
      return (
        <div className='flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4'>
          <div className='w-full max-w-md text-center'>
            <div className='mb-8'>
              <span className='text-8xl'>🎯💥</span>
            </div>
            <h1 className='mb-4 text-2xl font-bold text-gray-900 dark:text-white'>
              SmartFyt Student Error
            </h1>
            <p className='mb-8 text-gray-600 dark:text-gray-400'>
              The application encountered a critical error. Please refresh the
              page or contact support if the problem persists.
            </p>
            <div className='space-y-4'>
              <Button
                variant='default'
                onClick={() => window.location.reload()}
                className='w-full cursor-pointer'
                size='lg'
              >
                Refresh App
              </Button>
              <Button
                variant='outline'
                onClick={() => (window.location.href = '/')}
                className='w-full cursor-pointer'
                size='lg'
              >
                Go to Home
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className='mt-8 rounded-lg border bg-white dark:bg-gray-800 p-4 text-left'>
                <summary className='cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'>
                  Technical Details (Development)
                </summary>
                <div className='mt-3 space-y-2'>
                  <div className='text-xs dark:text-gray-300'>
                    <strong>Error:</strong> {this.state.error?.message}
                  </div>
                  <pre className='max-h-32 overflow-auto rounded bg-gray-100 dark:bg-gray-700 p-2 text-xs dark:text-gray-300'>
                    {this.state.error?.stack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper for card-level errors
export function CardErrorBoundary({
  children,
  name,
  fallback,
}: {
  children: ReactNode;
  name?: string;
  fallback?: ReactNode;
}) {
  return (
    <ErrorBoundary level='card' name={name} fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}

// Convenience wrapper for page-level errors
export function PageErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <ErrorBoundary level='page' fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}

// Convenience wrapper for app-level errors
export function AppErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <ErrorBoundary level='app' fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}
