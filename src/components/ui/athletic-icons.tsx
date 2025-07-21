'use client';

import { ReactNode } from 'react';

type IconSize = 'sm' | 'md' | 'lg' | 'xl';
type IconVariant =
  | 'health'
  | 'journal'
  | 'quest'
  | 'performance'
  | 'goal'
  | 'team'
  | 'tech'
  | 'auth';

interface AthleticIconProps {
  size?: IconSize;
  variant?: IconVariant;
  className?: string;
  children?: ReactNode;
}

// Get consistent icon styling
const getIconStyles = (variant: IconVariant, size: IconSize) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-12 h-12 text-xl',
    xl: 'w-16 h-16 text-2xl',
  };

  const variantStyles = {
    health: 'bg-gradient-to-br from-secondary-400 to-secondary-600',
    journal: 'bg-gradient-to-br from-success-400 to-success-600',
    quest: 'bg-gradient-to-br from-primary-400 to-primary-600',
    performance: 'bg-gradient-to-br from-warning-400 to-primary-500',
    goal: 'bg-gradient-to-br from-danger-400 to-primary-500',
    team: 'bg-gradient-to-br from-primary-400 to-secondary-500',
    tech: 'bg-gradient-to-br from-neutral-400 to-neutral-600',
    auth: 'bg-gradient-to-br from-primary-400 to-primary-600',
  };

  return `${sizeStyles[size]} ${variantStyles[variant]} rounded-lg flex items-center justify-center text-white shadow-sm`;
};

export function AthleticIcon({
  size = 'md',
  variant = 'health',
  className = '',
  children,
}: AthleticIconProps) {
  const iconStyles = getIconStyles(variant, size);

  return <div className={`${iconStyles} ${className}`}>{children}</div>;
}

// Pre-defined athletic icons for common use cases
export const AthleticIcons = {
  Health: ({ size = 'md' }: { size?: IconSize }) => (
    <AthleticIcon size={size} variant='health'>
      📊
    </AthleticIcon>
  ),
  Journal: ({ size = 'md' }: { size?: IconSize }) => (
    <AthleticIcon size={size} variant='journal'>
      📝
    </AthleticIcon>
  ),
  Quest: ({ size = 'md' }: { size?: IconSize }) => (
    <AthleticIcon size={size} variant='quest'>
      🎮
    </AthleticIcon>
  ),
  Performance: ({ size = 'md' }: { size?: IconSize }) => (
    <AthleticIcon size={size} variant='performance'>
      📈
    </AthleticIcon>
  ),
  Goal: ({ size = 'md' }: { size?: IconSize }) => (
    <AthleticIcon size={size} variant='goal'>
      🎯
    </AthleticIcon>
  ),
  Team: ({ size = 'md' }: { size?: IconSize }) => (
    <AthleticIcon size={size} variant='team'>
      👥
    </AthleticIcon>
  ),
  Tech: ({ size = 'md' }: { size?: IconSize }) => (
    <AthleticIcon size={size} variant='tech'>
      ⚛️
    </AthleticIcon>
  ),
  Auth: ({ size = 'md' }: { size?: IconSize }) => (
    <AthleticIcon size={size} variant='auth'>
      🔐
    </AthleticIcon>
  ),
  Connection: ({ size = 'md' }: { size?: IconSize }) => (
    <AthleticIcon size={size} variant='tech'>
      🔌
    </AthleticIcon>
  ),
  Mobile: ({ size = 'md' }: { size?: IconSize }) => (
    <AthleticIcon size={size} variant='tech'>
      📱
    </AthleticIcon>
  ),
};
