'use client';

import {
  Trophy,
  Target,
  CheckCircle,
  Plus,
  Star,
  TrendingUp,
  Users,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { AuthGuard } from '@/components/auth';
import { PageLayout } from '@/components/layout/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { trackPageView, trackQuestInteraction } from '@/lib/analytics';
import { logger } from '@/lib/logger';
import {
  useCurrentQuests,
  useCompletedQuests,
  useUserStats,
  useQuestCompletion,
  useTotalQuestScore,
  useCompleteQuest,
  useAssignNewQuests,
} from '@/lib/services/quest-service';

export default function QuestsPage() {
  const { user } = useAuth();

  // Quest completion state
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(true);

  // React Query hooks for data fetching
  const {
    data: currentQuests = [],
    isLoading: currentQuestsLoading,
    error: currentQuestsError,
  } = useCurrentQuests(user?.id || null);

  const {
    data: completedQuests = [],
    isLoading: completedQuestsLoading,
    error: completedQuestsError,
  } = useCompletedQuests(user?.id || null);

  const {
    data: userStats = [],
    isLoading: userStatsLoading,
    error: userStatsError,
  } = useUserStats(user?.id || null);

  const {
    data: questCompletion = {
      totalQuests: 0,
      completedQuests: 0,
      percentage: 0,
    },
    isLoading: questCompletionLoading,
    error: questCompletionError,
  } = useQuestCompletion(user?.id || null);

  const {
    data: totalScore = 0,
    isLoading: totalScoreLoading,
    error: totalScoreError,
  } = useTotalQuestScore(user?.id || null);

  // Track quests page view
  useEffect(() => {
    if (user?.id) {
      trackPageView('quests', {
        user_id: user.id,
        current_quests_count: currentQuests?.length || 0,
        completed_quests_count: completedQuests?.length || 0,
      });
    }
  }, [user?.id, currentQuests?.length, completedQuests?.length]);

  // Mutation hooks
  const completeQuestMutation = useCompleteQuest();
  const assignNewQuestsMutation = useAssignNewQuests();

  // Loading and error states
  const isLoading =
    currentQuestsLoading ||
    completedQuestsLoading ||
    userStatsLoading ||
    questCompletionLoading ||
    totalScoreLoading;

  const error =
    currentQuestsError ||
    completedQuestsError ||
    userStatsError ||
    questCompletionError ||
    totalScoreError;

  const handleCompleteQuest = async (questId: string, notes?: string) => {
    try {
      const result = await completeQuestMutation.mutateAsync({
        userId: user?.id || '',
        questId,
        notes,
      });

      if (result.success) {
        trackQuestInteraction('completed', questId, {
          user_id: user?.id,
          quest_id: questId,
          points_earned: result.points || 0,
          new_level: result.newLevel || 0,
        });
        setExpandedQuestId(null);
        setCompletionNotes('');
      }
    } catch (error) {
      logger.error('Failed to complete quest:', error);
    }
  };

  const handleAssignNewQuests = async () => {
    try {
      const result = await assignNewQuestsMutation.mutateAsync(user?.id || '');

      if (result && result.length > 0) {
        trackQuestInteraction('assigned_new', undefined, {
          user_id: user?.id,
          quests_assigned: result.length,
        });
      }
    } catch (error) {
      logger.error('Failed to assign new quests:', error);
    }
  };

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

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'strength':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-400';
      case 'endurance':
        return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-400';
      case 'grit':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400';
      case 'accountability':
        return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400';
      case 'speed':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400';
      case 'agility':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400';
      case 'confidence':
        return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-400';
      case 'leadership':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <AuthGuard>
      <PageLayout
        title='Quests'
        subtitle='Complete challenges to earn points and level up'
      >
        {/* Loading State - Show skeleton content instead of blocking spinner */}
        {isLoading && (
          <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
            <div className='space-y-6'>
              {/* Quest Overview Skeleton */}
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                      <div className='h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                    </div>
                    <div className='h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                  </div>
                  <div className='h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Quest Overview Cards Skeleton */}
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    {[1, 2, 3, 4].map(i => (
                      <Card key={i}>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <div className='h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                          <div className='h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                        </CardHeader>
                        <CardContent>
                          <div className='h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                          <div className='mt-2 h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quest Cards Skeleton */}
              <div className='space-y-4'>
                <div className='h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-1'>
                  {[1, 2, 3].map(i => (
                    <Card key={i}>
                      <CardHeader>
                        <div className='flex items-start gap-3'>
                          <div className='h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700'></div>
                          <div className='flex-1 space-y-2'>
                            <div className='h-5 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                            <div className='h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                            <div className='h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='mb-4 text-4xl'>⚠️</div>
              <p className='text-gray-600 dark:text-gray-400'>
                {error instanceof Error
                  ? error.message
                  : 'Failed to load quest data'}
              </p>
              <Button onClick={() => window.location.reload()} className='mt-4'>
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && (
          <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
            <div className='space-y-6'>
              {/* Quest Overview Section */}
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Star className='h-5 w-5 text-warning-500' />
                      <CardTitle>Quest Overview</CardTitle>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                      className='h-8 w-8 p-0'
                    >
                      {isOverviewExpanded ? (
                        <ChevronUp className='h-4 w-4' />
                      ) : (
                        <ChevronDown className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                  <CardDescription>
                    Your quest statistics and progress across all categories
                  </CardDescription>
                </CardHeader>
                {isOverviewExpanded && (
                  <CardContent className='space-y-6'>
                    {/* Quest Overview Cards */}
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>
                            Total Score
                          </CardTitle>
                          <Trophy className='h-4 w-4 text-warning-500' />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>{totalScore}</div>
                          <p className='text-xs text-muted-foreground'>
                            Points earned
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>
                            Active Quests
                          </CardTitle>
                          <Target className='h-4 w-4 text-secondary-500' />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            {currentQuests.length}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            Available to complete
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>
                            Completed
                          </CardTitle>
                          <CheckCircle className='h-4 w-4 text-success-500' />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            {completedQuests.length}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            Quests finished
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>
                            Completion Rate
                          </CardTitle>
                          <TrendingUp className='h-4 w-4 text-primary-500' />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            {questCompletion.percentage}%
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            Success rate
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quest Progress */}
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>
                          Overall Progress
                        </span>
                        <span className='text-sm text-muted-foreground'>
                          {questCompletion.completedQuests} /{' '}
                          {questCompletion.totalQuests} quests
                        </span>
                      </div>
                      <Progress
                        value={questCompletion.percentage}
                        className='h-2'
                      />

                      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                        {userStats.map(stat => (
                          <div
                            key={stat.categoryId}
                            className='rounded-lg border p-3'
                          >
                            <div className='mb-2 flex items-center justify-between'>
                              <span className='text-sm font-medium'>
                                {stat.categoryName}
                              </span>
                              <Badge variant='secondary'>
                                Level {stat.level}
                              </Badge>
                            </div>
                            <div className='flex items-center justify-between'>
                              <span className='text-xs text-muted-foreground'>
                                {stat.points} points
                              </span>
                              <Progress
                                value={((stat.points % 100) / 100) * 100}
                                className='h-1 w-16'
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Quest Tabs */}
              <Tabs defaultValue='current' className='space-y-4'>
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger value='current'>Current Quests</TabsTrigger>
                  <TabsTrigger value='completed'>Completed</TabsTrigger>
                  <TabsTrigger value='leaderboard'>Leaderboard</TabsTrigger>
                </TabsList>

                <TabsContent value='current' className='space-y-4'>
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <h3 className='text-lg font-semibold'>Active Quests</h3>
                    <Button
                      onClick={handleAssignNewQuests}
                      disabled={assignNewQuestsMutation.isPending}
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      {assignNewQuestsMutation.isPending
                        ? 'Getting Quests...'
                        : 'Get New Quests'}
                    </Button>
                  </div>

                  {currentQuests.length === 0 ? (
                    <Card>
                      <CardContent className='flex flex-col items-center justify-center py-8'>
                        <Target className='mb-4 h-12 w-12 text-gray-400' />
                        <h4 className='mb-2 text-lg font-semibold'>
                          No Active Quests
                        </h4>
                        <p className='mb-4 text-center text-muted-foreground'>
                          You don&apos;t have any active quests. Get new quests
                          to start earning points!
                        </p>
                        <Button
                          onClick={handleAssignNewQuests}
                          disabled={assignNewQuestsMutation.isPending}
                        >
                          <Plus className='mr-2 h-4 w-4' />
                          {assignNewQuestsMutation.isPending
                            ? 'Getting Quests...'
                            : 'Get New Quests'}
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-1'>
                      {currentQuests.map(quest => (
                        <Card
                          key={quest.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            expandedQuestId === quest.id
                              ? 'ring-2 ring-green-200 dark:ring-green-800'
                              : ''
                          }`}
                          onClick={() =>
                            setExpandedQuestId(
                              expandedQuestId === quest.id ? null : quest.id
                            )
                          }
                        >
                          <CardHeader>
                            <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                              <div className='flex items-start gap-3'>
                                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20'>
                                  <span className='text-lg'>
                                    {getCategoryIcon(quest.categoryName)}
                                  </span>
                                </div>
                                <div className='min-w-0 flex-1'>
                                  <CardTitle className='text-lg'>
                                    {quest.title}
                                  </CardTitle>
                                  <CardDescription className='mt-1'>
                                    {quest.description}
                                  </CardDescription>
                                </div>
                              </div>
                              <Badge
                                className={getCategoryColor(quest.categoryName)}
                              >
                                {quest.pointValue} pts
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                              <Badge variant='outline'>
                                {quest.categoryName}
                              </Badge>
                              <div className='flex items-center gap-2'>
                                <span className='text-sm text-muted-foreground'>
                                  Click to{' '}
                                  {expandedQuestId === quest.id
                                    ? 'collapse'
                                    : 'complete'}
                                </span>
                                <CheckCircle
                                  className={`h-4 w-4 transition-colors ${
                                    expandedQuestId === quest.id
                                      ? 'text-success-600'
                                      : 'text-gray-400'
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Expandable completion section */}
                            {expandedQuestId === quest.id && (
                              <div className='mt-6 space-y-4 rounded-lg border bg-gray-50/50 p-4 dark:bg-gray-800/50'>
                                <div className='space-y-3'>
                                  <div>
                                    <Label
                                      htmlFor={`notes-${quest.id}`}
                                      className='text-sm font-medium'
                                    >
                                      Completion Notes (Optional)
                                    </Label>
                                    <Textarea
                                      id={`notes-${quest.id}`}
                                      placeholder='Share your experience completing this quest...'
                                      value={completionNotes}
                                      onChange={e =>
                                        setCompletionNotes(e.target.value)
                                      }
                                      maxLength={280}
                                      className='mt-2 select-text'
                                    />
                                    <p className='mt-1 text-xs text-muted-foreground'>
                                      {completionNotes.length}/280 characters
                                    </p>
                                  </div>

                                  <div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
                                    <Button
                                      variant='outline'
                                      onClick={e => {
                                        e.stopPropagation();
                                        setExpandedQuestId(null);
                                        setCompletionNotes('');
                                      }}
                                      size='sm'
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleCompleteQuest(
                                          quest.id,
                                          completionNotes
                                        );
                                      }}
                                      disabled={completeQuestMutation.isPending}
                                      className='bg-success-600 hover:bg-success-700'
                                      size='sm'
                                    >
                                      {completeQuestMutation.isPending
                                        ? 'Completing...'
                                        : 'Complete Quest'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value='completed' className='space-y-4'>
                  <h3 className='text-lg font-semibold'>Completed Quests</h3>

                  {completedQuests.length === 0 ? (
                    <Card>
                      <CardContent className='flex flex-col items-center justify-center py-8'>
                        <CheckCircle className='mb-4 h-12 w-12 text-gray-400' />
                        <h4 className='mb-2 text-lg font-semibold'>
                          No Completed Quests
                        </h4>
                        <p className='text-center text-muted-foreground'>
                          Complete your first quest to see it here!
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-1'>
                      {completedQuests.map(quest => (
                        <Card
                          key={quest.id}
                          className='border-success-200 bg-success-50/50 dark:border-success-800 dark:bg-success-900/10'
                        >
                          <CardHeader>
                            <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                              <div className='flex items-start gap-3'>
                                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-success-100 dark:bg-success-900/20'>
                                  <CheckCircle className='h-5 w-5 text-success-600' />
                                </div>
                                <div className='min-w-0 flex-1'>
                                  <CardTitle className='text-lg'>
                                    {quest.title}
                                  </CardTitle>
                                  <CardDescription className='mt-1'>
                                    {quest.description}
                                  </CardDescription>
                                  {quest.notes && (
                                    <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
                                      <span className='font-medium'>
                                        Notes:
                                      </span>{' '}
                                      {quest.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className='text-right'>
                                <Badge className='bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400'>
                                  +{quest.pointValue} pts
                                </Badge>
                                <p className='mt-1 text-xs text-muted-foreground'>
                                  {quest.completedAt
                                    ? new Date(
                                        quest.completedAt
                                      ).toLocaleDateString()
                                    : 'Completed'}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value='leaderboard' className='space-y-4'>
                  <h3 className='text-lg font-semibold'>Quest Leaderboard</h3>
                  <Card>
                    <CardContent className='flex flex-col items-center justify-center py-8'>
                      <Users className='mb-4 h-12 w-12 text-gray-400' />
                      <h4 className='mb-2 text-lg font-semibold'>
                        Leaderboard Coming Soon
                      </h4>
                      <p className='text-center text-muted-foreground'>
                        Compete with your teammates and see who&apos;s earning
                        the most quest points!
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </PageLayout>
    </AuthGuard>
  );
}
