'use client'

import React, { Component, ReactNode } from 'react'
import { Card, CardBody, Button, Chip } from '@heroui/react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  level?: 'card' | 'page' | 'app'
  name?: string
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error)
      console.error('Error Info:', errorInfo)
    }

    // In production, you would send this to your error reporting service
    // Example: Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const { level = 'card', name, fallback } = this.props

      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Card-level error boundary
      if (level === 'card') {
        return (
          <Card className="border border-red-200 bg-red-50">
            <CardBody className="p-4 text-center">
              <div className="mb-3">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-sm font-medium text-red-800 mb-2">
                {name ? `${name} Error` : 'Card Error'}
              </h3>
              <p className="text-xs text-red-600 mb-3">
                Something went wrong loading this content.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={this.handleRetry}
                  className="cursor-pointer"
                >
                  Try Again
                </Button>
                {process.env.NODE_ENV === 'development' && (
                  <Chip size="sm" variant="flat" color="danger" className="text-xs">
                    Dev: {this.state.error?.message}
                  </Chip>
                )}
              </div>
            </CardBody>
          </Card>
        )
      }

      // Page-level error boundary
      if (level === 'page') {
        return (
          <div className="min-h-screen-mobile flex items-center justify-center p-4">
            <Card className="max-w-md w-full border border-red-200">
              <CardBody className="text-center p-8">
                <div className="mb-6">
                  <span className="text-6xl">🏃‍♂️💥</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Something went wrong
                </h2>
                <p className="text-gray-600 mb-6">
                  We're sorry, but something unexpected happened. Our team has been notified.
                </p>
                <div className="space-y-3">
                  <Button
                    color="primary"
                    variant="solid"
                    onPress={this.handleRetry}
                    className="cursor-pointer w-full"
                  >
                    Try Again
                  </Button>
                  <Button
                    color="default"
                    variant="bordered"
                    onPress={() => window.location.href = '/'}
                    className="cursor-pointer w-full border-2"
                  >
                    Go Home
                  </Button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                      Debug Info (Dev Only)
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
                      {this.state.error?.stack}
                    </pre>
                  </details>
                )}
              </CardBody>
            </Card>
          </div>
        )
      }

      // App-level error boundary (most critical)
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <span className="text-8xl">🎯💥</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              SmartFyt Student Error
            </h1>
            <p className="text-gray-600 mb-8">
              The application encountered a critical error. Please refresh the page or contact support if the problem persists.
            </p>
            <div className="space-y-4">
              <Button
                color="primary"
                variant="solid"
                onPress={() => window.location.reload()}
                className="cursor-pointer w-full"
                size="lg"
              >
                Refresh App
              </Button>
              <Button
                color="secondary"
                variant="bordered"
                onPress={() => window.location.href = '/'}
                className="cursor-pointer w-full border-2"
                size="lg"
              >
                Go to Home
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 text-left bg-white rounded-lg border p-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Technical Details (Development)
                </summary>
                <div className="mt-3 space-y-2">
                  <div className="text-xs">
                    <strong>Error:</strong> {this.state.error?.message}
                  </div>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {this.state.error?.stack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Convenience wrapper for card-level errors
export function CardErrorBoundary({ 
  children, 
  name, 
  fallback 
}: { 
  children: ReactNode
  name?: string
  fallback?: ReactNode 
}) {
  return (
    <ErrorBoundary level="card" name={name} fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}

// Convenience wrapper for page-level errors
export function PageErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  return (
    <ErrorBoundary level="page" fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}

// Convenience wrapper for app-level errors
export function AppErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  return (
    <ErrorBoundary level="app" fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
} 