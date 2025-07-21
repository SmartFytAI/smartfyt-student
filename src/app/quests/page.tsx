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
import { useCallback, useEffect, useState } from 'react';

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
import { logger } from '@/lib/logger';
import {
  getCurrentQuests,
  getCompletedQuests,
  getUserStats,
  completeQuest,
  assignNewQuests,
  getQuestCompletion,
  getTotalQuestScore,
  type Quest,
  type UserStat,
  type QuestCompletion,
} from '@/lib/services/quest-service';

export default function QuestsPage() {
  const { user } = useAuth();

  const [currentQuests, setCurrentQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [questCompletion, setQuestCompletion] = useState<QuestCompletion>({
    totalQuests: 0,
    completedQuests: 0,
    percentage: 0,
  });
  const [totalScore, setTotalScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quest completion state
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(true);

  const fetchQuestData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      logger.debug('🔍 Fetching quest data for user:', user.id);

      const [current, completed, stats, completion, score] = await Promise.all([
        getCurrentQuests(user.id),
        getCompletedQuests(user.id),
        getUserStats(user.id),
        getQuestCompletion(user.id),
        getTotalQuestScore(user.id),
      ]);

      setCurrentQuests(current);
      setCompletedQuests(completed);
      setUserStats(stats);
      setQuestCompletion(completion);
      setTotalScore(score);

      logger.debug('✅ Quest data fetched successfully');
    } catch (err) {
      logger.error('❌ Error fetching quest data:', err);
      setError('Failed to load quest data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchQuestData();
  }, [fetchQuestData]);

  const handleCompleteQuest = async (questId: string) => {
    if (!user?.id) return;

    try {
      setIsCompleting(true);

      const result = await completeQuest(user.id, questId, completionNotes);

      if (result.success) {
        logger.debug('✅ Quest completed successfully');
        setExpandedQuestId(null);
        setCompletionNotes('');
        // Refresh quest data
        await fetchQuestData();
      } else {
        setError('Failed to complete quest');
      }
    } catch (err) {
      logger.error('❌ Error completing quest:', err);
      setError('Failed to complete quest');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleAssignNewQuests = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      await assignNewQuests(user.id);
      await fetchQuestData();
    } catch (err) {
      logger.error('❌ Error assigning new quests:', err);
      setError('Failed to assign new quests');
    } finally {
      setIsLoading(false);
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
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'endurance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'grit':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'accountability':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'speed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'agility':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'confidence':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      case 'leadership':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <PageLayout
        title='Quests'
        subtitle='Complete challenges to earn points and level up'
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600'></div>
            <p className='mt-4 text-gray-600 dark:text-gray-400'>
              Loading quests...
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        title='Quests'
        subtitle='Complete challenges to earn points and level up'
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='mb-4 text-4xl'>⚠️</div>
            <p className='text-gray-600 dark:text-gray-400'>{error}</p>
            <Button onClick={fetchQuestData} className='mt-4'>
              Retry
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title='Quests'
      subtitle='Complete challenges to earn points and level up'
    >
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='space-y-6'>
          {/* Quest Overview Section */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Star className='h-5 w-5 text-yellow-500' />
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
                      <Trophy className='h-4 w-4 text-yellow-500' />
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
                      <Target className='h-4 w-4 text-blue-500' />
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
                      <CheckCircle className='h-4 w-4 text-green-500' />
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
                      <TrendingUp className='h-4 w-4 text-purple-500' />
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
                          <Badge variant='secondary'>Level {stat.level}</Badge>
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
                <Button onClick={handleAssignNewQuests} disabled={isLoading}>
                  <Plus className='mr-2 h-4 w-4' />
                  Get New Quests
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
                      You don&apos;t have any active quests. Get new quests to
                      start earning points!
                    </p>
                    <Button onClick={handleAssignNewQuests}>
                      <Plus className='mr-2 h-4 w-4' />
                      Get New Quests
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
                            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20'>
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
                          <Badge variant='outline'>{quest.categoryName}</Badge>
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
                                  ? 'text-green-600'
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
                                    handleCompleteQuest(quest.id);
                                  }}
                                  disabled={isCompleting}
                                  className='bg-green-600 hover:bg-green-700'
                                  size='sm'
                                >
                                  {isCompleting
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
                      className='border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10'
                    >
                      <CardHeader>
                        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                          <div className='flex items-start gap-3'>
                            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
                              <CheckCircle className='h-5 w-5 text-green-600' />
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
                                  <span className='font-medium'>Notes:</span>{' '}
                                  {quest.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className='text-right'>
                            <Badge className='bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'>
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
                    Compete with your teammates and see who&apos;s earning the
                    most quest points!
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}
