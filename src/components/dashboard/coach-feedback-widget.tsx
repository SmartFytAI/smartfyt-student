import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

interface CoachFeedback {
  id: string;
  coachName: string;
  message: string;
  date: string;
  type: 'positive' | 'improvement' | 'general';
  isRead: boolean;
}

interface CoachFeedbackWidgetProps {
  userId: string;
  onViewAll?: () => void;
}

export function CoachFeedbackWidget({
  userId,
  onViewAll,
}: CoachFeedbackWidgetProps) {
  const [feedback, setFeedback] = useState<CoachFeedback[]>([
    {
      id: '1',
      coachName: 'Coach Johnson',
      message:
        'Great work on your conditioning this week! Your sprint times are improving.',
      date: '2024-01-15',
      type: 'positive',
      isRead: false,
    },
    {
      id: '2',
      coachName: 'Coach Smith',
      message:
        "Focus on your form during weight training. Let's work on technique.",
      date: '2024-01-14',
      type: 'improvement',
      isRead: true,
    },
    {
      id: '3',
      coachName: 'Coach Davis',
      message: 'Remember to hydrate properly before practice tomorrow.',
      date: '2024-01-13',
      type: 'general',
      isRead: true,
    },
  ]);

  const unreadCount = feedback.filter(f => !f.isRead).length;

  const handleMarkAsRead = (feedbackId: string) => {
    setFeedback(prev =>
      prev.map(f => (f.id === feedbackId ? { ...f, isRead: true } : f))
    );
    logger.info('Coach feedback marked as read', { feedbackId, userId });
  };

  const getTypeColor = (type: CoachFeedback['type']) => {
    switch (type) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'improvement':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'general':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: CoachFeedback['type']) => {
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

  return (
    <Card className='h-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold dark:text-white'>
            Coach Feedback
          </CardTitle>
          {unreadCount > 0 && (
            <Badge variant='destructive' className='text-xs'>
              {unreadCount} new
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        {feedback.length === 0 ? (
          <div className='py-6 text-center'>
            <div className='mb-2 text-4xl'>👨‍💼</div>
            <p className='text-sm font-medium dark:text-gray-300'>
              No Feedback Yet
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Your coaches will appear here
            </p>
          </div>
        ) : (
          <>
            {feedback.slice(0, 2).map(item => (
              <div
                key={item.id}
                className={`rounded-lg border p-3 transition-colors ${
                  item.isRead
                    ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                    : 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                }`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-1 flex items-center gap-2'>
                      <span className='text-sm font-medium dark:text-gray-300'>
                        {item.coachName}
                      </span>
                      <Badge
                        variant='secondary'
                        className={`text-xs ${getTypeColor(item.type)}`}
                      >
                        {getTypeIcon(item.type)} {item.type}
                      </Badge>
                    </div>
                    <p className='line-clamp-2 text-sm text-gray-600 dark:text-gray-400'>
                      {item.message}
                    </p>
                    <p className='mt-1 text-xs text-gray-500 dark:text-gray-500'>
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  {!item.isRead && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleMarkAsRead(item.id)}
                      className='ml-2 h-6 w-6 p-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                    >
                      ✓
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {feedback.length > 2 && (
              <div className='pt-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={onViewAll}
                  className='w-full text-sm'
                >
                  View All Feedback ({feedback.length})
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
