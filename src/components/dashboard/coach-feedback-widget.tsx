import { CardErrorBoundary } from '@/components/error/error-boundary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WidgetCard } from '@/components/ui/widget-card';
import { logger } from '@/lib/logger';
import {
  useCoachFeedback,
  useMarkFeedbackAsRead,
} from '@/lib/services/coach-feedback-service';

interface CoachFeedbackWidgetProps {
  userId: string;
  onViewAll?: () => void;
}

function CoachFeedbackWidgetContent({
  userId,
  onViewAll,
}: CoachFeedbackWidgetProps) {
  // React Query hooks for coach feedback with caching
  const {
    data: feedbackResponse,
    isLoading,
    error,
    refetch,
  } = useCoachFeedback(userId);

  const markAsReadMutation = useMarkFeedbackAsRead();

  const feedback = feedbackResponse?.data || [];
  const unreadCount = feedback.filter(f => !f.isRead).length;

  const handleMarkAsRead = async (feedbackId: string) => {
    try {
      await markAsReadMutation.mutateAsync({ userId, feedbackId });
      logger.info('Coach feedback marked as read', { feedbackId, userId });
    } catch (err) {
      logger.error('Error marking feedback as read:', err);
    }
  };

  const getTypeColor = (type: 'positive' | 'improvement' | 'general') => {
    switch (type) {
      case 'positive':
        return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400';
      case 'improvement':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400';
      case 'general':
        return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-400';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-400';
    }
  };

  const getTypeIcon = (type: 'positive' | 'improvement' | 'general') => {
    switch (type) {
      case 'positive':
        return '👍';
      case 'improvement':
        return '💪';
      case 'general':
        return '📝';
      default:
        return '💬';
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className='py-6 text-center'>
          <div className='mb-2 text-4xl'>⚠️</div>
          <p className='text-sm font-medium dark:text-gray-300'>
            Unable to load feedback
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      );
    }

    if (feedback.length === 0) {
      return (
        <div className='py-6 text-center'>
          <div className='mb-2 text-4xl'>👨‍💼</div>
          <p className='text-sm font-medium dark:text-gray-300'>
            No Feedback Yet
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Your coaches will appear here
          </p>
        </div>
      );
    }

    return (
      <div className='max-h-[400px] space-y-3 overflow-y-auto'>
        {feedback.slice(0, 3).map(item => (
          <div
            key={item.id}
            className={`rounded-lg border p-3 ${
              item.isRead
                ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                : 'border-primary-200 bg-primary-50 dark:border-primary-700 dark:bg-primary-900/20'
            }`}
          >
            <div className='mb-2 flex items-start justify-between'>
              <div className='flex items-center gap-2'>
                <span className='text-lg'>{getTypeIcon(item.type)}</span>
                <span className='text-sm font-medium text-gray-900 dark:text-white'>
                  {item.coachName}
                </span>
                <Badge
                  variant='outline'
                  className={`text-xs ${getTypeColor(item.type)}`}
                >
                  {item.type}
                </Badge>
              </div>
              {!item.isRead && (
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => handleMarkAsRead(item.id)}
                  disabled={markAsReadMutation.isPending}
                  className='h-6 px-2 text-xs'
                >
                  Mark Read
                </Button>
              )}
            </div>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              {item.message}
            </p>
            <p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
              {new Date(item.date).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <WidgetCard
      title={`Coach Feedback${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
      onViewAll={onViewAll}
      loading={isLoading}
      error={error instanceof Error ? error.message : error}
      colorScheme='primary'
      onRetry={() => refetch()}
      showSkeleton={true}
    >
      {renderContent()}
    </WidgetCard>
  );
}

export function CoachFeedbackWidget({
  userId,
  onViewAll,
}: CoachFeedbackWidgetProps) {
  return (
    <CardErrorBoundary>
      <CoachFeedbackWidgetContent userId={userId} onViewAll={onViewAll} />
    </CardErrorBoundary>
  );
}
