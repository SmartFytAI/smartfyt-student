/**
 * Theme utilities for consistent color usage across components
 * Based on the journal calendar color scheme
 */

export interface WidgetColors {
  primary: string;
  border: string;
  bg: string;
  hover: string;
  loading: string;
}

export interface LoadingSpinnerColors {
  primary: string;
  secondary: string;
  white: string;
}

/**
 * Get consistent colors for different widget types
 */
export const getWidgetColors = (
  type: 'quest' | 'feedback' | 'team' | 'journal'
): WidgetColors => {
  switch (type) {
    case 'quest':
      return {
        primary: 'text-primary-600 dark:text-primary-400',
        border: 'border-primary-200 dark:border-primary-700',
        bg: 'bg-primary-50 dark:bg-primary-900/20',
        hover: 'hover:text-primary-700 dark:hover:text-primary-300',
        loading: 'border-primary-600 dark:border-primary-400',
      };
    case 'feedback':
      return {
        primary: 'text-secondary-600 dark:text-secondary-400',
        border: 'border-secondary-200 dark:border-secondary-700',
        bg: 'bg-secondary-50 dark:bg-secondary-900/20',
        hover: 'hover:text-secondary-700 dark:hover:text-secondary-300',
        loading: 'border-secondary-600 dark:border-secondary-400',
      };
    case 'team':
      return {
        primary: 'text-primary-600 dark:text-primary-400',
        border: 'border-primary-200 dark:border-primary-700',
        bg: 'bg-primary-50 dark:bg-primary-900/20',
        hover: 'hover:text-primary-700 dark:hover:text-primary-300',
        loading: 'border-primary-600 dark:border-primary-400',
      };
    case 'journal':
      return {
        primary: 'text-primary-600 dark:text-primary-400',
        border: 'border-primary-200 dark:border-primary-700',
        bg: 'bg-primary-50 dark:bg-primary-900/20',
        hover: 'hover:text-primary-700 dark:hover:text-primary-300',
        loading: 'border-primary-600 dark:border-primary-400',
      };
    default:
      return {
        primary: 'text-primary-600 dark:text-primary-400',
        border: 'border-primary-200 dark:border-primary-700',
        bg: 'bg-primary-50 dark:bg-primary-900/20',
        hover: 'hover:text-primary-700 dark:hover:text-primary-300',
        loading: 'border-primary-600 dark:border-primary-400',
      };
  }
};

/**
 * Get loading spinner colors
 */
export const getLoadingSpinnerColor = (
  type: 'primary' | 'secondary' | 'white'
): string => {
  switch (type) {
    case 'primary':
      return 'border-primary-600 dark:border-primary-400';
    case 'secondary':
      return 'border-secondary-600 dark:border-secondary-400';
    case 'white':
      return 'border-white';
    default:
      return 'border-primary-600 dark:border-primary-400';
  }
};

/**
 * Get button colors for different variants
 */
export const getButtonColors = (
  variant: 'primary' | 'secondary' | 'outline' | 'ghost'
): string => {
  switch (variant) {
    case 'primary':
      return 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white';
    case 'secondary':
      return 'bg-secondary-600 hover:bg-secondary-700 dark:bg-secondary-500 dark:hover:bg-secondary-600 text-white';
    case 'outline':
      return 'border border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20';
    case 'ghost':
      return 'text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20';
    default:
      return 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white';
  }
};

/**
 * Get badge colors for different types
 */
export const getBadgeColors = (
  type: 'positive' | 'improvement' | 'general' | 'success' | 'warning' | 'error'
): string => {
  switch (type) {
    case 'positive':
    case 'success':
      return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400';
    case 'improvement':
    case 'warning':
      return 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400';
    case 'general':
      return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-400';
    case 'error':
      return 'bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-400';
    default:
      return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-400';
  }
};

/**
 * Get text colors for different contexts
 */
export const getTextColors = (
  context: 'primary' | 'secondary' | 'muted' | 'inverse'
): string => {
  switch (context) {
    case 'primary':
      return 'text-neutral-900 dark:text-white';
    case 'secondary':
      return 'text-neutral-600 dark:text-neutral-400';
    case 'muted':
      return 'text-neutral-500 dark:text-neutral-500';
    case 'inverse':
      return 'text-white dark:text-neutral-900';
    default:
      return 'text-neutral-900 dark:text-white';
  }
};

/**
 * Get gradient styles for range inputs and sliders
 */
export const getGradientStyles = (
  type: 'sleep' | 'stress' | 'activity',
  value: number,
  max: number
): React.CSSProperties => {
  const percentage = (value / max) * 100;

  switch (type) {
    case 'sleep':
      // Blue gradient for sleep (0% to 100%)
      return {
        background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${percentage}%, rgb(229 231 235) ${percentage}%, rgb(229 231 235) 100%)`,
      };
    case 'stress':
      // Multi-color gradient for stress levels
      return {
        background: `linear-gradient(to right, rgb(16 185 129) 0%, rgb(16 185 129) 20%, rgb(245 158 11) 20%, rgb(245 158 11) 40%, rgb(249 115 22) 40%, rgb(249 115 22) 60%, rgb(239 68 68) 60%, rgb(239 68 68) 80%, rgb(220 38 38) 80%, rgb(220 38 38) 100%)`,
      };
    case 'activity':
      // Green gradient for activity
      return {
        background: `linear-gradient(to right, rgb(34 197 94) 0%, rgb(34 197 94) ${percentage}%, rgb(229 231 235) ${percentage}%, rgb(229 231 235) 100%)`,
      };
    default:
      return {
        background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${percentage}%, rgb(229 231 235) ${percentage}%, rgb(229 231 235) 100%)`,
      };
  }
};
