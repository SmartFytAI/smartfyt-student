'use client';

import {
  Target,
  Users,
  Plus,
  Star,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Zap,
  Heart,
  Award,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useUserTeams } from '@/hooks/use-team-api';
import {
  useTeamQuests,
  useTeamChallenges,
  useTeamRecognitions,
  useUserRecognitionLimits,
  useCreateTeamQuest,
  useCreateTeamChallenge,
  useGiveRecognition,
} from '@/hooks/use-team-challenges-api';
import { trackPageView } from '@/lib/analytics';
import { logger } from '@/lib/logger';

export default function TeamChallengesPage() {
  const { user } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(true);

  // Get user's teams
  const {
    data: teamsResponse,
    isLoading: teamsLoading,
    error: teamsError,
  } = useUserTeams(user?.id || null);

  const teams = React.useMemo(
    () => teamsResponse?.data || [],
    [teamsResponse?.data]
  );

  // Set first team as selected if available
  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Team challenges data
  const {
    data: teamQuestsResponse,
    isLoading: teamQuestsLoading,
    error: teamQuestsError,
  } = useTeamQuests(selectedTeamId);

  const {
    data: teamChallengesResponse,
    isLoading: teamChallengesLoading,
    error: teamChallengesError,
  } = useTeamChallenges(selectedTeamId);

  const {
    data: teamRecognitionsResponse,
    isLoading: teamRecognitionsLoading,
    error: teamRecognitionsError,
  } = useTeamRecognitions(selectedTeamId);

  const {
    data: recognitionLimitsResponse,
    isLoading: _recognitionLimitsLoading,
    error: _recognitionLimitsError,
  } = useUserRecognitionLimits(user?.id || null, new Date());

  // Mutations
  const createQuestMutation = useCreateTeamQuest();
  const createChallengeMutation = useCreateTeamChallenge();
  const giveRecognitionMutation = useGiveRecognition();

  // Track page view
  useEffect(() => {
    if (user?.id) {
      trackPageView('team-challenges', {
        user_id: user.id,
        teams_count: teams.length,
        selected_team_id: selectedTeamId,
      });
    }
  }, [user?.id, teams.length, selectedTeamId]);

  const isLoading =
    teamsLoading ||
    teamQuestsLoading ||
    teamChallengesLoading ||
    teamRecognitionsLoading;
  const error =
    teamsError ||
    teamQuestsError ||
    teamChallengesError ||
    teamRecognitionsError;

  const teamQuests = teamQuestsResponse?.data || [];
  const teamChallenges = teamChallengesResponse?.data || [];
  const teamRecognitions = teamRecognitionsResponse?.data || [];
  const recognitionLimits = recognitionLimitsResponse?.data;

  // Calculate stats
  const totalQuests = teamQuests.length;
  const activeChallenges = teamChallenges.filter(c => c.isActive).length;
  const totalRecognitions = teamRecognitions.length;
  const completionRate =
    totalQuests > 0
      ? Math.round(
          (teamQuests.filter(q => q.isActive).length / totalQuests) * 100
        )
      : 0;

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
      case 'health':
        return '💧';
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
      case 'health':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400';
      case 'medium':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400';
      case 'hard':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getRecognitionIcon = (type: string) => {
    switch (type) {
      case 'clap':
        return '👏';
      case 'fire':
        return '🔥';
      case 'heart':
        return '❤️';
      case 'flex':
        return '💪';
      case 'zap':
        return '⚡';
      case 'trophy':
        return '🏆';
      default:
        return '👏';
    }
  };

  const getRecognitionColor = (type: string) => {
    switch (type) {
      case 'clap':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'fire':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'heart':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      case 'flex':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'zap':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'trophy':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <AuthGuard>
      <PageLayout
        title='Team Challenges'
        subtitle='Compete with teammates and earn recognition'
      >
        {/* Loading State */}
        {isLoading && (
          <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                      <div className='h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                    </div>
                    <div className='h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    {[1, 2, 3, 4].map(i => (
                      <Card key={i}>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <div className='h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                          <div className='h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                        </CardHeader>
                        <CardContent>
                          <div className='h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                  : 'Failed to load team challenges'}
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
              {/* Team Selection */}
              {teams.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Select Team</CardTitle>
                    <CardDescription>
                      Choose a team to view their challenges and quests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-wrap gap-2'>
                      {teams.map(team => (
                        <Button
                          key={team.id}
                          variant={
                            selectedTeamId === team.id ? 'default' : 'outline'
                          }
                          onClick={() => setSelectedTeamId(team.id)}
                          className='h-auto p-3'
                        >
                          <div className='text-left'>
                            <div className='font-medium'>{team.name}</div>
                            <div className='text-xs text-muted-foreground'>
                              {team.sport?.name} • {team.school?.name}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Overview Section */}
              {selectedTeamId && (
                <Card>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Star className='h-5 w-5 text-warning-500' />
                        <CardTitle>Team Challenges Overview</CardTitle>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          setIsOverviewExpanded(!isOverviewExpanded)
                        }
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
                      Your team&apos;s challenge statistics and progress
                    </CardDescription>
                  </CardHeader>
                  {isOverviewExpanded && (
                    <CardContent>
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                        <Card>
                          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>
                              Active Quests
                            </CardTitle>
                            <Target className='h-4 w-4 text-secondary-500' />
                          </CardHeader>
                          <CardContent>
                            <div className='text-2xl font-bold'>
                              {totalQuests}
                            </div>
                            <p className='text-xs text-muted-foreground'>
                              Available to complete
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>
                              Active Challenges
                            </CardTitle>
                            <Users className='h-4 w-4 text-primary-500' />
                          </CardHeader>
                          <CardContent>
                            <div className='text-2xl font-bold'>
                              {activeChallenges}
                            </div>
                            <p className='text-xs text-muted-foreground'>
                              Team competitions
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>
                              Recognitions
                            </CardTitle>
                            <Award className='h-4 w-4 text-warning-500' />
                          </CardHeader>
                          <CardContent>
                            <div className='text-2xl font-bold'>
                              {totalRecognitions}
                            </div>
                            <p className='text-xs text-muted-foreground'>
                              Given this week
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>
                              Completion Rate
                            </CardTitle>
                            <TrendingUp className='h-4 w-4 text-success-500' />
                          </CardHeader>
                          <CardContent>
                            <div className='text-2xl font-bold'>
                              {completionRate}%
                            </div>
                            <p className='text-xs text-muted-foreground'>
                              Quest success rate
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Main Tabs */}
              {selectedTeamId && (
                <Tabs defaultValue='quests' className='space-y-4'>
                  <TabsList className='grid w-full grid-cols-4'>
                    <TabsTrigger value='quests'>Team Quests</TabsTrigger>
                    <TabsTrigger value='challenges'>Challenges</TabsTrigger>
                    <TabsTrigger value='recognition'>Recognition</TabsTrigger>
                    <TabsTrigger value='create'>Create</TabsTrigger>
                  </TabsList>

                  {/* Team Quests Tab */}
                  <TabsContent value='quests' className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-lg font-semibold'>Team Quests</h3>
                      <Button
                        onClick={() => {
                          // TODO: Open quest creation modal
                          logger.info('Create quest button clicked');
                        }}
                        disabled={createQuestMutation.isPending}
                      >
                        <Plus className='mr-2 h-4 w-4' />
                        {createQuestMutation.isPending
                          ? 'Creating...'
                          : 'Create Quest'}
                      </Button>
                    </div>

                    {teamQuests.length === 0 ? (
                      <Card>
                        <CardContent className='flex flex-col items-center justify-center py-8'>
                          <Target className='mb-4 h-12 w-12 text-gray-400' />
                          <h4 className='mb-2 text-lg font-semibold'>
                            No Team Quests
                          </h4>
                          <p className='mb-4 text-center text-muted-foreground'>
                            Create your first team quest to get started!
                          </p>
                          <Button
                            onClick={() => {
                              // TODO: Open quest creation modal
                              logger.info('Create first quest button clicked');
                            }}
                          >
                            <Plus className='mr-2 h-4 w-4' />
                            Create Quest
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-1'>
                        {teamQuests.map(quest => (
                          <Card
                            key={quest.id}
                            className='transition-shadow hover:shadow-md'
                          >
                            <CardHeader>
                              <div className='flex items-start justify-between'>
                                <div className='flex items-start gap-3'>
                                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20'>
                                    <span className='text-lg'>
                                      {getCategoryIcon(quest.category)}
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
                                  className={getCategoryColor(quest.category)}
                                >
                                  {quest.pointValue} pts
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className='flex items-center justify-between'>
                                <div className='flex gap-2'>
                                  <Badge variant='outline'>
                                    {quest.category}
                                  </Badge>
                                  <Badge
                                    className={getDifficultyColor(
                                      quest.difficulty
                                    )}
                                  >
                                    {quest.difficulty}
                                  </Badge>
                                  <Badge variant='secondary'>
                                    {quest.duration}
                                  </Badge>
                                </div>
                                <Button variant='outline' size='sm'>
                                  View Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Challenges Tab */}
                  <TabsContent value='challenges' className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-lg font-semibold'>Team Challenges</h3>
                      <Button
                        onClick={() => {
                          // TODO: Open challenge creation modal
                          logger.info('Create challenge button clicked');
                        }}
                        disabled={createChallengeMutation.isPending}
                      >
                        <Plus className='mr-2 h-4 w-4' />
                        {createChallengeMutation.isPending
                          ? 'Creating...'
                          : 'Create Challenge'}
                      </Button>
                    </div>

                    {teamChallenges.length === 0 ? (
                      <Card>
                        <CardContent className='flex flex-col items-center justify-center py-8'>
                          <Users className='mb-4 h-12 w-12 text-gray-400' />
                          <h4 className='mb-2 text-lg font-semibold'>
                            No Team Challenges
                          </h4>
                          <p className='mb-4 text-center text-muted-foreground'>
                            Create a challenge to compete with your teammates!
                          </p>
                          <Button
                            onClick={() => {
                              // TODO: Open challenge creation modal
                              logger.info(
                                'Create first challenge button clicked'
                              );
                            }}
                          >
                            <Plus className='mr-2 h-4 w-4' />
                            Create Challenge
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-1'>
                        {teamChallenges.map(challenge => (
                          <Card
                            key={challenge.id}
                            className='transition-shadow hover:shadow-md'
                          >
                            <CardHeader>
                              <div className='flex items-start justify-between'>
                                <div className='flex items-start gap-3'>
                                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-900/20'>
                                    <Zap className='h-5 w-5 text-secondary-600' />
                                  </div>
                                  <div className='min-w-0 flex-1'>
                                    <CardTitle className='text-lg'>
                                      {challenge.title}
                                    </CardTitle>
                                    <CardDescription className='mt-1'>
                                      {challenge.description}
                                    </CardDescription>
                                  </div>
                                </div>
                                <Badge variant='outline'>
                                  {challenge.duration} days
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className='flex items-center justify-between'>
                                <div className='flex gap-2'>
                                  <Badge variant='outline'>
                                    {challenge.type.replace('_', ' ')}
                                  </Badge>
                                  <Badge variant='secondary'>
                                    {challenge.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                                <Button variant='outline' size='sm'>
                                  Join Challenge
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Recognition Tab */}
                  <TabsContent value='recognition' className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-lg font-semibold'>
                        Team Recognition
                      </h3>
                      <Button
                        onClick={() => {
                          // TODO: Open recognition modal
                          logger.info('Give recognition button clicked');
                        }}
                        disabled={giveRecognitionMutation.isPending}
                      >
                        <Heart className='mr-2 h-4 w-4' />
                        {giveRecognitionMutation.isPending
                          ? 'Sending...'
                          : 'Give Recognition'}
                      </Button>
                    </div>

                    {teamRecognitions.length === 0 ? (
                      <Card>
                        <CardContent className='flex flex-col items-center justify-center py-8'>
                          <Award className='mb-4 h-12 w-12 text-gray-400' />
                          <h4 className='mb-2 text-lg font-semibold'>
                            No Recognitions Yet
                          </h4>
                          <p className='mb-4 text-center text-muted-foreground'>
                            Be the first to recognize your teammates!
                          </p>
                          <Button
                            onClick={() => {
                              // TODO: Open recognition modal
                              logger.info(
                                'Give first recognition button clicked'
                              );
                            }}
                          >
                            <Heart className='mr-2 h-4 w-4' />
                            Give Recognition
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className='space-y-4'>
                        {teamRecognitions.map(recognition => (
                          <Card
                            key={recognition.id}
                            className='transition-shadow hover:shadow-md'
                          >
                            <CardContent className='p-4'>
                              <div className='flex items-start gap-3'>
                                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20'>
                                  <span className='text-lg'>
                                    {getRecognitionIcon(recognition.type)}
                                  </span>
                                </div>
                                <div className='flex-1'>
                                  <div className='mb-1 flex items-center gap-2'>
                                    <span className='font-medium'>
                                      Teammate
                                    </span>
                                    <Badge
                                      className={getRecognitionColor(
                                        recognition.type
                                      )}
                                    >
                                      {recognition.type}
                                    </Badge>
                                  </div>
                                  {recognition.message && (
                                    <p className='mb-2 text-sm text-muted-foreground'>
                                      &ldquo;{recognition.message}&rdquo;
                                    </p>
                                  )}
                                  <p className='text-xs text-muted-foreground'>
                                    {new Date(
                                      recognition.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Recognition Limits */}
                    {recognitionLimits && (
                      <Card>
                        <CardHeader>
                          <CardTitle className='text-sm'>
                            Daily Recognition Limits
                          </CardTitle>
                          <CardDescription>
                            Track your daily recognition usage
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'>
                            {[
                              {
                                type: 'clap',
                                limit: 10,
                                used: recognitionLimits.clapsUsed,
                              },
                              {
                                type: 'fire',
                                limit: 5,
                                used: recognitionLimits.firesUsed,
                              },
                              {
                                type: 'heart',
                                limit: 8,
                                used: recognitionLimits.heartsUsed,
                              },
                              {
                                type: 'flex',
                                limit: 3,
                                used: recognitionLimits.flexesUsed,
                              },
                              {
                                type: 'zap',
                                limit: 5,
                                used: recognitionLimits.zapsUsed,
                              },
                              {
                                type: 'trophy',
                                limit: 2,
                                used: recognitionLimits.trophiesUsed,
                              },
                            ].map(({ type, limit, used }) => (
                              <div key={type} className='text-center'>
                                <div className='mb-1 text-2xl'>
                                  {getRecognitionIcon(type)}
                                </div>
                                <div className='text-sm font-medium capitalize'>
                                  {type}
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  {used}/{limit}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Create Tab */}
                  <TabsContent value='create' className='space-y-4'>
                    <h3 className='text-lg font-semibold'>Create New</h3>
                    <div className='grid gap-4 md:grid-cols-2'>
                      <Card className='cursor-pointer transition-shadow hover:shadow-md'>
                        <CardContent className='p-6'>
                          <div className='text-center'>
                            <Target className='mx-auto mb-4 h-12 w-12 text-primary-600' />
                            <h4 className='mb-2 text-lg font-semibold'>
                              Create Team Quest
                            </h4>
                            <p className='mb-4 text-sm text-muted-foreground'>
                              Create a new quest for your team to complete
                              together
                            </p>
                            <Button
                              onClick={() => {
                                // TODO: Open quest creation modal
                                logger.info(
                                  'Create quest from create tab clicked'
                                );
                              }}
                              className='w-full'
                            >
                              <Plus className='mr-2 h-4 w-4' />
                              Create Quest
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className='cursor-pointer transition-shadow hover:shadow-md'>
                        <CardContent className='p-6'>
                          <div className='text-center'>
                            <Users className='mx-auto mb-4 h-12 w-12 text-secondary-600' />
                            <h4 className='mb-2 text-lg font-semibold'>
                              Create Challenge
                            </h4>
                            <p className='mb-4 text-sm text-muted-foreground'>
                              Challenge your teammates to a competition
                            </p>
                            <Button
                              onClick={() => {
                                // TODO: Open challenge creation modal
                                logger.info(
                                  'Create challenge from create tab clicked'
                                );
                              }}
                              className='w-full'
                            >
                              <Plus className='mr-2 h-4 w-4' />
                              Create Challenge
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              )}

              {/* No Teams Message */}
              {!isLoading && !error && teams.length === 0 && (
                <Card>
                  <CardContent className='flex flex-col items-center justify-center py-8'>
                    <Users className='mb-4 h-12 w-12 text-gray-400' />
                    <h4 className='mb-2 text-lg font-semibold'>
                      No Teams Found
                    </h4>
                    <p className='text-center text-muted-foreground'>
                      You need to be part of a team to access team challenges.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </PageLayout>
    </AuthGuard>
  );
}
