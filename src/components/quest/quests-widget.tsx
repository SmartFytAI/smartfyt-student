'use client';

import { CardErrorBoundary } from '@/components/error/error-boundary';
import { WidgetCard } from '@/components/ui/widget-card';
import { useCurrentQuests } from '@/lib/services/quest-service';

interface QuestsWidgetProps {
  userId: string;
  onViewAll: () => void;
}

function QuestsWidgetContent({ userId, onViewAll }: QuestsWidgetProps) {
  // React Query hook for data fetching with caching
  const {
    data: quests = [],
    isLoading,
    error,
    refetch,
  } = useCurrentQuests(userId);

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'strength':
        return '💪';
      case 'endurance':
        return '⏱️';
      case 'grit':
        return '🔥';
      case 'accountability':
        return '✅';
      case 'speed':
        return '⚡';
      case 'agility':
        return '🏃';
      case 'confidence':
        return '🏆';
      case 'leadership':
        return '👥';
      case 'time management':
        return '⏰';
      case 'communication':
        return '💬';
      case 'networking ability':
        return '🌐';
      case 'mindfulness & well-being':
        return '🧘';
      default:
        return '⚔️';
    }
  };

  const renderContent = () => {
    if (quests.length === 0) {
      return (
        <div className='py-6 text-center'>
          <div className='mb-2 text-4xl'>⚔️</div>
          <p className='text-sm font-medium dark:text-gray-300'>
            No quests available
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Check back tomorrow for new challenges!
          </p>
        </div>
      );
    }

    // Show up to 3 quests in the widget
    const displayQuests = quests.slice(0, 3);
    const remainingCount = quests.length - 3;

    return (
      <div className='space-y-3'>
        {displayQuests.map(quest => (
          <div
            key={quest.id}
            className='flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'
          >
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20'>
              <span className='text-sm'>
                {getCategoryIcon(quest.categoryName)}
              </span>
            </div>
            <div className='min-w-0 flex-1'>
              <h4 className='truncate text-sm font-medium text-gray-900 dark:text-white'>
                {quest.title}
              </h4>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                {quest.categoryName} • {quest.pointValue} pts
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <span className='inline-flex items-center rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'>
                Active
              </span>
            </div>
          </div>
        ))}

        {remainingCount > 0 && (
          <div className='text-center'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              +{remainingCount} more quest{remainingCount === 1 ? '' : 's'}{' '}
              available
            </p>
          </div>
        )}

        <button
          onClick={onViewAll}
          className='mt-4 w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
        >
          Complete Quests
        </button>
      </div>
    );
  };

  return (
    <WidgetCard
      title={`Today's Quests${quests.length > 0 ? ` (${quests.length})` : ''}`}
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

export function QuestsWidget({ userId, onViewAll }: QuestsWidgetProps) {
  return (
    <CardErrorBoundary>
      <QuestsWidgetContent userId={userId} onViewAll={onViewAll} />
    </CardErrorBoundary>
  );
}
