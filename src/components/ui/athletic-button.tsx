'use client'

import { Button } from '@heroui/react'
import { ReactNode } from 'react'

// Athletic button variants
type AthleticButtonVariant = 
  | 'primary-action'     // Main CTAs like Sign In
  | 'secondary-action'   // Secondary actions like Create Account
  | 'success-action'     // Success actions like Complete
  | 'warning-action'     // Warning actions like Review
  | 'danger-action'      // Danger actions like Sign Out, Delete
  | 'ghost-action'       // Subtle actions like Cancel
  | 'metric-action'      // Small metric-related actions

type ButtonSize = 'sm' | 'md' | 'lg'

interface AthleticButtonProps {
  children: ReactNode
  variant?: AthleticButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  isDisabled?: boolean
  startIcon?: ReactNode
  endIcon?: ReactNode
  fullWidth?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

// Get consistent athletic button styling
const getButtonConfig = (variant: AthleticButtonVariant) => {
  const configs = {
    'primary-action': {
      color: 'primary' as const,
      variant: 'shadow' as const,
      radius: 'full' as const,
      className: 'font-semibold'
    },
    'secondary-action': {
      color: 'secondary' as const,
      variant: 'bordered' as const,
      radius: 'full' as const,
      className: 'font-semibold border-2'
    },
    'success-action': {
      color: 'success' as const,
      variant: 'shadow' as const,
      radius: 'lg' as const,
      className: 'font-medium'
    },
    'warning-action': {
      color: 'warning' as const,
      variant: 'flat' as const,
      radius: 'lg' as const,
      className: 'font-medium'
    },
    'danger-action': {
      color: 'danger' as const,
      variant: 'flat' as const,
      radius: 'lg' as const,
      className: 'font-medium'
    },
    'ghost-action': {
      color: 'default' as const,
      variant: 'light' as const,
      radius: 'md' as const,
      className: 'font-normal'
    },
    'metric-action': {
      color: 'primary' as const,
      variant: 'flat' as const,
      radius: 'md' as const,
      className: 'font-medium text-sm'
    }
  }
  
  return configs[variant]
}

export function AthleticButton({
  children,
  variant = 'primary-action',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  startIcon,
  endIcon,
  fullWidth = false,
  onClick,
  className = '',
  type = 'button',
  ...props
}: AthleticButtonProps) {
  const config = getButtonConfig(variant)
  
  return (
    <Button
      color={config.color}
      variant={config.variant}
      radius={config.radius}
      size={size}
      isLoading={isLoading}
      isDisabled={isDisabled}
      fullWidth={fullWidth}
      startContent={startIcon}
      endContent={endIcon}
      onPress={onClick}
      type={type}
      className={`cursor-pointer transition-all duration-200 ${config.className} ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
}

// Specialized button variants for common use cases
export function PrimaryActionButton({
  children,
  icon,
  ...props
}: Omit<AthleticButtonProps, 'variant'> & { icon?: ReactNode }) {
  return (
    <AthleticButton
      variant="primary-action"
      startIcon={icon}
      {...props}
    >
      {children}
    </AthleticButton>
  )
}

export function SecondaryActionButton({
  children,
  icon,
  ...props
}: Omit<AthleticButtonProps, 'variant'> & { icon?: ReactNode }) {
  return (
    <AthleticButton
      variant="secondary-action"
      startIcon={icon}
      {...props}
    >
      {children}
    </AthleticButton>
  )
}

export function SuccessActionButton({
  children,
  icon,
  ...props
}: Omit<AthleticButtonProps, 'variant'> & { icon?: ReactNode }) {
  return (
    <AthleticButton
      variant="success-action"
      startIcon={icon}
      {...props}
    >
      {children}
    </AthleticButton>
  )
}

export function DangerActionButton({
  children,
  icon,
  ...props
}: Omit<AthleticButtonProps, 'variant'> & { icon?: ReactNode }) {
  return (
    <AthleticButton
      variant="danger-action"
      startIcon={icon}
      {...props}
    >
      {children}
    </AthleticButton>
  )
}

export function GhostActionButton({
  children,
  icon,
  ...props
}: Omit<AthleticButtonProps, 'variant'> & { icon?: ReactNode }) {
  return (
    <AthleticButton
      variant="ghost-action"
      startIcon={icon}
      {...props}
    >
      {children}
    </AthleticButton>
  )
} 