import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { WidgetCard } from '../widget-card';

// Mock the loading spinner component
vi.mock('@/components/ui/loading-spinner', () => ({
  LoadingSpinner: ({ colorScheme }: { colorScheme: string }) => (
    <div data-testid='loading-spinner' data-color={colorScheme}>
      Loading...
    </div>
  ),
}));

describe('WidgetCard', () => {
  const defaultProps = {
    title: 'Test Widget',
    children: <div data-testid='widget-content'>Widget Content</div>,
  };

  it('renders with title and content', () => {
    render(<WidgetCard {...defaultProps} />);

    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByTestId('widget-content')).toBeInTheDocument();
  });

  it('renders without header when showHeader is false', () => {
    render(<WidgetCard {...defaultProps} showHeader={false} />);

    expect(screen.queryByText('Test Widget')).not.toBeInTheDocument();
    expect(screen.getByTestId('widget-content')).toBeInTheDocument();
  });

  it('renders "View All" button when onViewAll is provided', () => {
    const onViewAll = vi.fn();
    render(<WidgetCard {...defaultProps} onViewAll={onViewAll} />);

    const viewAllButton = screen.getByText('View All →');
    expect(viewAllButton).toBeInTheDocument();

    fireEvent.click(viewAllButton);
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it('renders custom view all text', () => {
    const onViewAll = vi.fn();
    render(
      <WidgetCard
        {...defaultProps}
        onViewAll={onViewAll}
        viewAllText='Custom Text'
      />
    );

    expect(screen.getByText('Custom Text')).toBeInTheDocument();
  });

  it('shows loading spinner when loading is true and showSkeleton is false', () => {
    render(
      <WidgetCard {...defaultProps} loading={true} showSkeleton={false} />
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('widget-content')).not.toBeInTheDocument();
  });

  it('shows skeleton when loading is true and showSkeleton is true', () => {
    render(<WidgetCard {...defaultProps} loading={true} showSkeleton={true} />);

    // Should show skeleton components (they don't have data-testid, so check for skeleton classes)
    expect(screen.getByText('Test Widget')).toBeInTheDocument(); // Header still shows
    expect(screen.queryByTestId('widget-content')).not.toBeInTheDocument();
    // Check for skeleton elements by their classes
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('shows error message when error is provided', () => {
    const onRetry = vi.fn();
    render(
      <WidgetCard
        {...defaultProps}
        error='Something went wrong'
        onRetry={onRetry}
      />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Try Again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows error message without retry button when onRetry is not provided', () => {
    render(<WidgetCard {...defaultProps} error='Something went wrong' />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<WidgetCard {...defaultProps} className='custom-class' />);

    const card = screen.getByTestId('widget-content').closest('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('uses primary color scheme by default', () => {
    const onViewAll = vi.fn();
    render(<WidgetCard {...defaultProps} onViewAll={onViewAll} />);

    const viewAllButton = screen.getByText('View All →');
    expect(viewAllButton).toHaveClass('text-primary-600');
  });

  it('uses secondary color scheme when specified', () => {
    const onViewAll = vi.fn();
    render(
      <WidgetCard
        {...defaultProps}
        onViewAll={onViewAll}
        colorScheme='secondary'
      />
    );

    const viewAllButton = screen.getByText('View All →');
    expect(viewAllButton).toHaveClass('text-secondary-600');
  });

  it('renders content when not loading and no error', () => {
    render(<WidgetCard {...defaultProps} />);

    expect(screen.getByTestId('widget-content')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const onViewAll = vi.fn();
    render(<WidgetCard {...defaultProps} onViewAll={onViewAll} />);

    const title = screen.getByText('Test Widget');
    expect(title).toHaveClass('text-lg', 'font-semibold');

    const viewAllButton = screen.getByText('View All →');
    // The button is a regular button element, so it should be clickable
    expect(viewAllButton).toBeInTheDocument();
    expect(viewAllButton.tagName).toBe('BUTTON');
  });
});
