'use client'

import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { CardErrorBoundary } from '@/components/error/error-boundary'
import { ReactNode } from 'react'

// Base card variant types
type CardVariant = 'default' | 'feature' | 'status' | 'metric' | 'tech'
type CardSize = 'sm' | 'md' | 'lg'

interface AthleticCardProps {
  children: ReactNode
  className?: string
  variant?: CardVariant
  size?: CardSize
  title?: string
  subtitle?: string
  icon?: ReactNode
  metric?: {
    value: string | number
    label: string
    progress?: number
  }
  actions?: ReactNode
  errorBoundaryName?: string
  isHoverable?: boolean
  isClickable?: boolean
  onClick?: () => void
}

// Consistent card styling variants
const getCardStyles = (variant: CardVariant, isHoverable: boolean, isClickable: boolean) => {
  const baseStyles = "backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-900/90 transition-all duration-300"
  
  const variantStyles = {
    default: "shadow-md hover:shadow-lg",
    feature: "shadow-lg hover:shadow-xl rounded-2xl",
    status: "shadow-sm hover:shadow-md rounded-xl",
    metric: "shadow-md hover:shadow-lg rounded-xl bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95",
    tech: "shadow-sm hover:shadow-md rounded-lg border-dashed"
  }
  
  const hoverStyles = isHoverable ? "hover:scale-[1.02] hover:border-primary-200 dark:hover:border-primary-700" : ""
  const clickableStyles = isClickable ? "cursor-pointer active:scale-[0.99]" : ""
  
  return `${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${clickableStyles}`
}

// Header component for consistent card headers
function AthleticCardHeader({ 
  title, 
  subtitle, 
  icon 
}: { 
  title?: string
  subtitle?: string
  icon?: ReactNode 
}) {
  if (!title && !subtitle && !icon) return null
  
  return (
    <CardHeader className="flex gap-3 pb-3">
      {icon && (
        <div className="flex-shrink-0">
          {icon}
        </div>
      )}
      <div className="flex flex-col">
        {title && (
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </p>
        )}
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
    </CardHeader>
  )
}

// Metric display component
function MetricDisplay({ 
  metric 
}: { 
  metric: { value: string | number; label: string; progress?: number } 
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          {metric.value}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {metric.label}
        </span>
      </div>
      {metric.progress !== undefined && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, metric.progress))}%` }}
          />
        </div>
      )}
    </div>
  )
}

// Main Athletic Card Component
export function AthleticCard({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  title,
  subtitle,
  icon,
  metric,
  actions,
  errorBoundaryName,
  isHoverable = true,
  isClickable = false,
  onClick,
  ...props
}: AthleticCardProps) {
  const cardStyles = getCardStyles(variant, isHoverable, isClickable)
  
  const sizeStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }
  
  const cardContent = (
    <Card 
      className={`${cardStyles} ${className}`}
      onClick={onClick}
      {...props}
    >
      <AthleticCardHeader title={title} subtitle={subtitle} icon={icon} />
      
      <CardContent className={`${sizeStyles[size]} ${title || subtitle || icon ? 'pt-0' : ''}`}>
        {metric && <MetricDisplay metric={metric} />}
        {children}
      </CardContent>
      
      {actions && (
        <CardFooter className="pt-0">
          {actions}
        </CardFooter>
      )}
    </Card>
  )
  
  // Wrap in error boundary if name provided
  if (errorBoundaryName) {
    return (
      <CardErrorBoundary name={errorBoundaryName}>
        {cardContent}
      </CardErrorBoundary>
    )
  }
  
  return cardContent
}

// Specialized card variants for common use cases
export function FeatureCard({
  children,
  title,
  icon,
  metric,
  isClickable = true,
  errorBoundaryName,
  ...props
}: Omit<AthleticCardProps, 'variant'>) {
  return (
    <AthleticCard
      variant="feature"
      title={title}
      icon={icon}
      metric={metric}
      isClickable={isClickable}
      errorBoundaryName={errorBoundaryName}
      {...props}
    >
      {children}
    </AthleticCard>
  )
}

export function StatusCard({
  children,
  title,
  errorBoundaryName,
  ...props
}: Omit<AthleticCardProps, 'variant'>) {
  return (
    <AthleticCard
      variant="status"
      title={title}
      errorBoundaryName={errorBoundaryName}
      isHoverable={false}
      {...props}
    >
      {children}
    </AthleticCard>
  )
}

export function MetricCard({
  metric,
  errorBoundaryName,
  ...props
}: Omit<AthleticCardProps, 'variant'> & { metric: NonNullable<AthleticCardProps['metric']> }) {
  return (
    <AthleticCard
      variant="metric"
      metric={metric}
      errorBoundaryName={errorBoundaryName}
      {...props}
    />
  )
}

export function TechCard({
  children,
  title,
  icon,
  errorBoundaryName,
  ...props
}: Omit<AthleticCardProps, 'variant'>) {
  return (
    <AthleticCard
      variant="tech"
      title={title}
      icon={icon}
      errorBoundaryName={errorBoundaryName}
      isHoverable={false}
      {...props}
    >
      {children}
    </AthleticCard>
  )
} 