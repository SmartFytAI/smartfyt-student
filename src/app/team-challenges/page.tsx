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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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

  // Inline form states
  const [showQuestForm, setShowQuestForm] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [showRecognitionForm, setShowRecognitionForm] = useState(false);

  // Form data states
  const [questFormData, setQuestFormData] = useState({
    title: '',
    description: '',
    category: 'strength',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    duration: 'weekly' as 'daily' | 'weekly' | 'monthly',
    pointValue: 50,
  });

  const [challengeFormData, setChallengeFormData] = useState({
    title: '',
    description: '',
    type: 'step_competition' as
      | 'step_competition'
      | 'workout'
      | 'habit'
      | 'skill'
      | 'team_building',
    duration: 7,
    targetValue: 10000,
  });

  const [recognitionFormData, setRecognitionFormData] = useState({
    recipientId: '',
    type: 'clap' as 'clap' | 'fire' | 'heart' | 'flex' | 'zap' | 'trophy',
    message: '',
  });

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

  // Get team members for recognition (mock data for now)
  const teamMembers = [
    { id: '1', firstName: 'Alex', lastName: 'Johnson' },
    { id: '2', firstName: 'Sam', lastName: 'Williams' },
    { id: '3', firstName: 'Jordan', lastName: 'Davis' },
    { id: '4', firstName: 'Taylor', lastName: 'Brown' },
  ].filter(member => member.id !== user?.id); // Exclude current user

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

  // Form submission handlers
  const handleCreateQuest = async () => {
    if (!selectedTeamId || !user?.id) return;

    try {
      await createQuestMutation.mutateAsync({
        teamId: selectedTeamId,
        title: questFormData.title,
        description: questFormData.description,
        category: questFormData.category,
        difficulty: questFormData.difficulty as 'easy' | 'medium' | 'hard',
        pointValue: questFormData.pointValue,
        duration: questFormData.duration as 'daily' | 'weekly' | 'monthly',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        userIds: [], // Will be populated by backend
      });

      // Reset form
      setQuestFormData({
        title: '',
        description: '',
        category: 'strength',
        difficulty: 'medium' as 'easy' | 'medium' | 'hard',
        duration: 'weekly' as 'daily' | 'weekly' | 'monthly',
        pointValue: 50,
      });
      setShowQuestForm(false);

      logger.info('Quest created successfully', { questData: questFormData });
    } catch (error) {
      logger.error('Failed to create quest', {
        error,
        questData: questFormData,
      });
    }
  };

  const handleCreateChallenge = async () => {
    if (!selectedTeamId || !user?.id) return;

    try {
      await createChallengeMutation.mutateAsync({
        teamId: selectedTeamId,
        title: challengeFormData.title,
        description: challengeFormData.description,
        type: challengeFormData.type as
          | 'step_competition'
          | 'workout'
          | 'habit'
          | 'skill'
          | 'team_building',
        duration: challengeFormData.duration,
        userIds: [], // Will be populated by backend
      });

      // Reset form
      setChallengeFormData({
        title: '',
        description: '',
        type: 'step_competition' as
          | 'step_competition'
          | 'workout'
          | 'habit'
          | 'skill'
          | 'team_building',
        duration: 7,
        targetValue: 10000,
      });
      setShowChallengeForm(false);

      logger.info('Challenge created successfully', {
        challengeData: challengeFormData,
      });
    } catch (error) {
      logger.error('Failed to create challenge', {
        error,
        challengeData: challengeFormData,
      });
    }
  };

  const handleGiveRecognition = async () => {
    if (!selectedTeamId || !user?.id || !recognitionFormData.recipientId)
      return;

    try {
      await giveRecognitionMutation.mutateAsync({
        teamId: selectedTeamId,
        fromUserId: user.id,
        toUserId: recognitionFormData.recipientId,
        type: recognitionFormData.type as
          | 'clap'
          | 'fire'
          | 'heart'
          | 'flex'
          | 'zap'
          | 'trophy',
        message: recognitionFormData.message,
      });

      // Reset form
      setRecognitionFormData({
        recipientId: '',
        type: 'clap',
        message: '',
      });
      setShowRecognitionForm(false);

      logger.info('Recognition given successfully', {
        recognitionData: recognitionFormData,
      });
    } catch (error) {
      logger.error('Failed to give recognition', {
        error,
        recognitionData: recognitionFormData,
      });
    }
  };

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
                        onClick={() => setShowQuestForm(!showQuestForm)}
                        disabled={createQuestMutation.isPending}
                      >
                        <Plus className='mr-2 h-4 w-4' />
                        {createQuestMutation.isPending
                          ? 'Creating...'
                          : showQuestForm
                            ? 'Cancel'
                            : 'Create Quest'}
                      </Button>
                    </div>

                    {/* Quest Creation Form */}
                    {showQuestForm && (
                      <Card className='border-2 border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/20'>
                        <CardHeader>
                          <CardTitle className='text-lg'>
                            Create New Team Quest
                          </CardTitle>
                          <CardDescription>
                            Create a quest for your team to complete together
                          </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                              <Label htmlFor='quest-title'>Quest Title</Label>
                              <Input
                                id='quest-title'
                                value={questFormData.title}
                                onChange={e =>
                                  setQuestFormData(prev => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
                                placeholder='Enter quest title'
                                className='w-full'
                              />
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='quest-category'>Category</Label>
                              <Select
                                value={questFormData.category}
                                onValueChange={value =>
                                  setQuestFormData(prev => ({
                                    ...prev,
                                    category: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='strength'>
                                    Strength
                                  </SelectItem>
                                  <SelectItem value='endurance'>
                                    Endurance
                                  </SelectItem>
                                  <SelectItem value='grit'>Grit</SelectItem>
                                  <SelectItem value='accountability'>
                                    Accountability
                                  </SelectItem>
                                  <SelectItem value='speed'>Speed</SelectItem>
                                  <SelectItem value='agility'>
                                    Agility
                                  </SelectItem>
                                  <SelectItem value='confidence'>
                                    Confidence
                                  </SelectItem>
                                  <SelectItem value='leadership'>
                                    Leadership
                                  </SelectItem>
                                  <SelectItem value='health'>Health</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor='quest-description'>
                              Description
                            </Label>
                            <Textarea
                              id='quest-description'
                              value={questFormData.description}
                              onChange={e =>
                                setQuestFormData(prev => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              placeholder='Describe what the quest involves'
                              className='min-h-[100px] w-full'
                            />
                          </div>

                          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            <div className='space-y-2'>
                              <Label htmlFor='quest-difficulty'>
                                Difficulty
                              </Label>
                              <Select
                                value={questFormData.difficulty}
                                onValueChange={value =>
                                  setQuestFormData(prev => ({
                                    ...prev,
                                    difficulty: value as
                                      | 'easy'
                                      | 'medium'
                                      | 'hard',
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='easy'>Easy</SelectItem>
                                  <SelectItem value='medium'>Medium</SelectItem>
                                  <SelectItem value='hard'>Hard</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='quest-duration'>Duration</Label>
                              <Select
                                value={questFormData.duration}
                                onValueChange={value =>
                                  setQuestFormData(prev => ({
                                    ...prev,
                                    duration: value as
                                      | 'daily'
                                      | 'weekly'
                                      | 'monthly',
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='daily'>Daily</SelectItem>
                                  <SelectItem value='weekly'>Weekly</SelectItem>
                                  <SelectItem value='monthly'>
                                    Monthly
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='quest-points'>Point Value</Label>
                              <Input
                                id='quest-points'
                                type='number'
                                value={questFormData.pointValue}
                                onChange={e =>
                                  setQuestFormData(prev => ({
                                    ...prev,
                                    pointValue: parseInt(e.target.value) || 0,
                                  }))
                                }
                                placeholder='50'
                                className='w-full'
                              />
                            </div>
                          </div>

                          <div className='flex gap-2 pt-2'>
                            <Button
                              onClick={handleCreateQuest}
                              disabled={
                                !questFormData.title ||
                                !questFormData.description ||
                                createQuestMutation.isPending
                              }
                              className='flex-1'
                            >
                              {createQuestMutation.isPending ? (
                                <>
                                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <Plus className='mr-2 h-4 w-4' />
                                  Create Quest
                                </>
                              )}
                            </Button>
                            <Button
                              variant='outline'
                              onClick={() => setShowQuestForm(false)}
                              disabled={createQuestMutation.isPending}
                            >
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

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
                        onClick={() => setShowChallengeForm(!showChallengeForm)}
                        disabled={createChallengeMutation.isPending}
                      >
                        <Plus className='mr-2 h-4 w-4' />
                        {createChallengeMutation.isPending
                          ? 'Creating...'
                          : showChallengeForm
                            ? 'Cancel'
                            : 'Create Challenge'}
                      </Button>
                    </div>

                    {/* Challenge Creation Form */}
                    {showChallengeForm && (
                      <Card className='border-2 border-secondary-200 bg-secondary-50/50 dark:border-secondary-800 dark:bg-secondary-900/20'>
                        <CardHeader>
                          <CardTitle className='text-lg'>
                            Create New Team Challenge
                          </CardTitle>
                          <CardDescription>
                            Challenge your teammates to a competition
                          </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                              <Label htmlFor='challenge-title'>
                                Challenge Title
                              </Label>
                              <Input
                                id='challenge-title'
                                value={challengeFormData.title}
                                onChange={e =>
                                  setChallengeFormData(prev => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
                                placeholder='Enter challenge title'
                                className='w-full'
                              />
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='challenge-type'>
                                Challenge Type
                              </Label>
                              <Select
                                value={challengeFormData.type}
                                onValueChange={value =>
                                  setChallengeFormData(prev => ({
                                    ...prev,
                                    type: value as
                                      | 'step_competition'
                                      | 'workout'
                                      | 'habit'
                                      | 'skill'
                                      | 'team_building',
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='step_competition'>
                                    Step Competition
                                  </SelectItem>
                                  <SelectItem value='workout'>
                                    Workout Challenge
                                  </SelectItem>
                                  <SelectItem value='habit'>
                                    Habit Building
                                  </SelectItem>
                                  <SelectItem value='skill'>
                                    Skill Development
                                  </SelectItem>
                                  <SelectItem value='team_building'>
                                    Team Building
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor='challenge-description'>
                              Description
                            </Label>
                            <Textarea
                              id='challenge-description'
                              value={challengeFormData.description}
                              onChange={e =>
                                setChallengeFormData(prev => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              placeholder='Describe the challenge rules and goals'
                              className='min-h-[100px] w-full'
                            />
                          </div>

                          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                              <Label htmlFor='challenge-duration'>
                                Duration (days)
                              </Label>
                              <Input
                                id='challenge-duration'
                                type='number'
                                value={challengeFormData.duration}
                                onChange={e =>
                                  setChallengeFormData(prev => ({
                                    ...prev,
                                    duration: parseInt(e.target.value) || 1,
                                  }))
                                }
                                placeholder='7'
                                className='w-full'
                                min='1'
                                max='30'
                              />
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='challenge-target'>
                                Target Value
                              </Label>
                              <Input
                                id='challenge-target'
                                type='number'
                                value={challengeFormData.targetValue}
                                onChange={e =>
                                  setChallengeFormData(prev => ({
                                    ...prev,
                                    targetValue: parseInt(e.target.value) || 0,
                                  }))
                                }
                                placeholder='10000'
                                className='w-full'
                                min='1'
                              />
                            </div>
                          </div>

                          <div className='flex gap-2 pt-2'>
                            <Button
                              onClick={handleCreateChallenge}
                              disabled={
                                !challengeFormData.title ||
                                !challengeFormData.description ||
                                createChallengeMutation.isPending
                              }
                              className='flex-1'
                            >
                              {createChallengeMutation.isPending ? (
                                <>
                                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <Plus className='mr-2 h-4 w-4' />
                                  Create Challenge
                                </>
                              )}
                            </Button>
                            <Button
                              variant='outline'
                              onClick={() => setShowChallengeForm(false)}
                              disabled={createChallengeMutation.isPending}
                            >
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

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
                        onClick={() =>
                          setShowRecognitionForm(!showRecognitionForm)
                        }
                        disabled={giveRecognitionMutation.isPending}
                      >
                        <Heart className='mr-2 h-4 w-4' />
                        {giveRecognitionMutation.isPending
                          ? 'Sending...'
                          : showRecognitionForm
                            ? 'Cancel'
                            : 'Give Recognition'}
                      </Button>
                    </div>

                    {/* Recognition Form */}
                    {showRecognitionForm && (
                      <Card className='border-2 border-warning-200 bg-warning-50/50 dark:border-warning-800 dark:bg-warning-900/20'>
                        <CardHeader>
                          <CardTitle className='text-lg'>
                            Give Recognition
                          </CardTitle>
                          <CardDescription>
                            Recognize a teammate for their achievements
                          </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                              <Label htmlFor='recognition-recipient'>
                                Recipient
                              </Label>
                              <Select
                                value={recognitionFormData.recipientId}
                                onValueChange={value =>
                                  setRecognitionFormData(prev => ({
                                    ...prev,
                                    recipientId: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder='Select a teammate' />
                                </SelectTrigger>
                                <SelectContent>
                                  {teamMembers.map(member => (
                                    <SelectItem
                                      key={member.id}
                                      value={member.id}
                                    >
                                      {member.firstName} {member.lastName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='recognition-type'>
                                Recognition Type
                              </Label>
                              <Select
                                value={recognitionFormData.type}
                                onValueChange={value =>
                                  setRecognitionFormData(prev => ({
                                    ...prev,
                                    type: value as
                                      | 'clap'
                                      | 'fire'
                                      | 'heart'
                                      | 'flex'
                                      | 'zap'
                                      | 'trophy',
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='clap'>👏 Clap</SelectItem>
                                  <SelectItem value='fire'>🔥 Fire</SelectItem>
                                  <SelectItem value='heart'>
                                    ❤️ Heart
                                  </SelectItem>
                                  <SelectItem value='flex'>💪 Flex</SelectItem>
                                  <SelectItem value='zap'>⚡ Zap</SelectItem>
                                  <SelectItem value='trophy'>
                                    🏆 Trophy
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor='recognition-message'>
                              Message (optional)
                            </Label>
                            <Textarea
                              id='recognition-message'
                              value={recognitionFormData.message}
                              onChange={e =>
                                setRecognitionFormData(prev => ({
                                  ...prev,
                                  message: e.target.value,
                                }))
                              }
                              placeholder='Add a personal message...'
                              className='min-h-[80px] w-full'
                              maxLength={200}
                            />
                            <p className='text-xs text-muted-foreground'>
                              {recognitionFormData.message.length}/200
                              characters
                            </p>
                          </div>

                          <div className='flex gap-2 pt-2'>
                            <Button
                              onClick={handleGiveRecognition}
                              disabled={
                                !recognitionFormData.recipientId ||
                                giveRecognitionMutation.isPending
                              }
                              className='flex-1'
                            >
                              {giveRecognitionMutation.isPending ? (
                                <>
                                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Heart className='mr-2 h-4 w-4' />
                                  Give Recognition
                                </>
                              )}
                            </Button>
                            <Button
                              variant='outline'
                              onClick={() => setShowRecognitionForm(false)}
                              disabled={giveRecognitionMutation.isPending}
                            >
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

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
                    <div className='grid gap-4 md:grid-cols-3'>
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
                              onClick={() => setShowQuestForm(!showQuestForm)}
                              className='w-full'
                            >
                              <Plus className='mr-2 h-4 w-4' />
                              {showQuestForm ? 'Cancel' : 'Create Quest'}
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
                              onClick={() =>
                                setShowChallengeForm(!showChallengeForm)
                              }
                              className='w-full'
                            >
                              <Plus className='mr-2 h-4 w-4' />
                              {showChallengeForm
                                ? 'Cancel'
                                : 'Create Challenge'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className='cursor-pointer transition-shadow hover:shadow-md'>
                        <CardContent className='p-6'>
                          <div className='text-center'>
                            <Heart className='mx-auto mb-4 h-12 w-12 text-warning-600' />
                            <h4 className='mb-2 text-lg font-semibold'>
                              Give Recognition
                            </h4>
                            <p className='mb-4 text-sm text-muted-foreground'>
                              Recognize a teammate for their achievements
                            </p>
                            <Button
                              onClick={() =>
                                setShowRecognitionForm(!showRecognitionForm)
                              }
                              className='w-full'
                            >
                              <Heart className='mr-2 h-4 w-4' />
                              {showRecognitionForm
                                ? 'Cancel'
                                : 'Give Recognition'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Inline Forms in Create Tab */}
                    {showQuestForm && (
                      <Card className='border-2 border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/20'>
                        <CardHeader>
                          <CardTitle className='text-lg'>
                            Create New Team Quest
                          </CardTitle>
                          <CardDescription>
                            Create a quest for your team to complete together
                          </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                              <Label htmlFor='quest-title-create'>
                                Quest Title
                              </Label>
                              <Input
                                id='quest-title-create'
                                value={questFormData.title}
                                onChange={e =>
                                  setQuestFormData(prev => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
                                placeholder='Enter quest title'
                                className='w-full'
                              />
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='quest-category-create'>
                                Category
                              </Label>
                              <Select
                                value={questFormData.category}
                                onValueChange={value =>
                                  setQuestFormData(prev => ({
                                    ...prev,
                                    category: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='strength'>
                                    Strength
                                  </SelectItem>
                                  <SelectItem value='endurance'>
                                    Endurance
                                  </SelectItem>
                                  <SelectItem value='grit'>Grit</SelectItem>
                                  <SelectItem value='accountability'>
                                    Accountability
                                  </SelectItem>
                                  <SelectItem value='speed'>Speed</SelectItem>
                                  <SelectItem value='agility'>
                                    Agility
                                  </SelectItem>
                                  <SelectItem value='confidence'>
                                    Confidence
                                  </SelectItem>
                                  <SelectItem value='leadership'>
                                    Leadership
                                  </SelectItem>
                                  <SelectItem value='health'>Health</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor='quest-description-create'>
                              Description
                            </Label>
                            <Textarea
                              id='quest-description-create'
                              value={questFormData.description}
                              onChange={e =>
                                setQuestFormData(prev => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              placeholder='Describe what the quest involves'
                              className='min-h-[100px] w-full'
                            />
                          </div>

                          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            <div className='space-y-2'>
                              <Label htmlFor='quest-difficulty-create'>
                                Difficulty
                              </Label>
                              <Select
                                value={questFormData.difficulty}
                                onValueChange={value =>
                                  setQuestFormData(prev => ({
                                    ...prev,
                                    difficulty: value as
                                      | 'easy'
                                      | 'medium'
                                      | 'hard',
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='easy'>Easy</SelectItem>
                                  <SelectItem value='medium'>Medium</SelectItem>
                                  <SelectItem value='hard'>Hard</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='quest-duration-create'>
                                Duration
                              </Label>
                              <Select
                                value={questFormData.duration}
                                onValueChange={value =>
                                  setQuestFormData(prev => ({
                                    ...prev,
                                    duration: value as
                                      | 'daily'
                                      | 'weekly'
                                      | 'monthly',
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='daily'>Daily</SelectItem>
                                  <SelectItem value='weekly'>Weekly</SelectItem>
                                  <SelectItem value='monthly'>
                                    Monthly
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='quest-points-create'>
                                Point Value
                              </Label>
                              <Input
                                id='quest-points-create'
                                type='number'
                                value={questFormData.pointValue}
                                onChange={e =>
                                  setQuestFormData(prev => ({
                                    ...prev,
                                    pointValue: parseInt(e.target.value) || 0,
                                  }))
                                }
                                placeholder='50'
                                className='w-full'
                              />
                            </div>
                          </div>

                          <div className='flex gap-2 pt-2'>
                            <Button
                              onClick={handleCreateQuest}
                              disabled={
                                !questFormData.title ||
                                !questFormData.description ||
                                createQuestMutation.isPending
                              }
                              className='flex-1'
                            >
                              {createQuestMutation.isPending ? (
                                <>
                                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <Plus className='mr-2 h-4 w-4' />
                                  Create Quest
                                </>
                              )}
                            </Button>
                            <Button
                              variant='outline'
                              onClick={() => setShowQuestForm(false)}
                              disabled={createQuestMutation.isPending}
                            >
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {showChallengeForm && (
                      <Card className='border-2 border-secondary-200 bg-secondary-50/50 dark:border-secondary-800 dark:bg-secondary-900/20'>
                        <CardHeader>
                          <CardTitle className='text-lg'>
                            Create New Team Challenge
                          </CardTitle>
                          <CardDescription>
                            Challenge your teammates to a competition
                          </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                              <Label htmlFor='challenge-title-create'>
                                Challenge Title
                              </Label>
                              <Input
                                id='challenge-title-create'
                                value={challengeFormData.title}
                                onChange={e =>
                                  setChallengeFormData(prev => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
                                placeholder='Enter challenge title'
                                className='w-full'
                              />
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='challenge-type-create'>
                                Challenge Type
                              </Label>
                              <Select
                                value={challengeFormData.type}
                                onValueChange={value =>
                                  setChallengeFormData(prev => ({
                                    ...prev,
                                    type: value as
                                      | 'step_competition'
                                      | 'workout'
                                      | 'habit'
                                      | 'skill'
                                      | 'team_building',
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='step_competition'>
                                    Step Competition
                                  </SelectItem>
                                  <SelectItem value='workout'>
                                    Workout Challenge
                                  </SelectItem>
                                  <SelectItem value='habit'>
                                    Habit Building
                                  </SelectItem>
                                  <SelectItem value='skill'>
                                    Skill Development
                                  </SelectItem>
                                  <SelectItem value='team_building'>
                                    Team Building
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor='challenge-description-create'>
                              Description
                            </Label>
                            <Textarea
                              id='challenge-description-create'
                              value={challengeFormData.description}
                              onChange={e =>
                                setChallengeFormData(prev => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              placeholder='Describe the challenge rules and goals'
                              className='min-h-[100px] w-full'
                            />
                          </div>

                          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                              <Label htmlFor='challenge-duration-create'>
                                Duration (days)
                              </Label>
                              <Input
                                id='challenge-duration-create'
                                type='number'
                                value={challengeFormData.duration}
                                onChange={e =>
                                  setChallengeFormData(prev => ({
                                    ...prev,
                                    duration: parseInt(e.target.value) || 1,
                                  }))
                                }
                                placeholder='7'
                                className='w-full'
                                min='1'
                                max='30'
                              />
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='challenge-target-create'>
                                Target Value
                              </Label>
                              <Input
                                id='challenge-target-create'
                                type='number'
                                value={challengeFormData.targetValue}
                                onChange={e =>
                                  setChallengeFormData(prev => ({
                                    ...prev,
                                    targetValue: parseInt(e.target.value) || 0,
                                  }))
                                }
                                placeholder='10000'
                                className='w-full'
                                min='1'
                              />
                            </div>
                          </div>

                          <div className='flex gap-2 pt-2'>
                            <Button
                              onClick={handleCreateChallenge}
                              disabled={
                                !challengeFormData.title ||
                                !challengeFormData.description ||
                                createChallengeMutation.isPending
                              }
                              className='flex-1'
                            >
                              {createChallengeMutation.isPending ? (
                                <>
                                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <Plus className='mr-2 h-4 w-4' />
                                  Create Challenge
                                </>
                              )}
                            </Button>
                            <Button
                              variant='outline'
                              onClick={() => setShowChallengeForm(false)}
                              disabled={createChallengeMutation.isPending}
                            >
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {showRecognitionForm && (
                      <Card className='border-2 border-warning-200 bg-warning-50/50 dark:border-warning-800 dark:bg-warning-900/20'>
                        <CardHeader>
                          <CardTitle className='text-lg'>
                            Give Recognition
                          </CardTitle>
                          <CardDescription>
                            Recognize a teammate for their achievements
                          </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                              <Label htmlFor='recognition-recipient-create'>
                                Recipient
                              </Label>
                              <Select
                                value={recognitionFormData.recipientId}
                                onValueChange={value =>
                                  setRecognitionFormData(prev => ({
                                    ...prev,
                                    recipientId: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder='Select a teammate' />
                                </SelectTrigger>
                                <SelectContent>
                                  {teamMembers.map(member => (
                                    <SelectItem
                                      key={member.id}
                                      value={member.id}
                                    >
                                      {member.firstName} {member.lastName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='recognition-type-create'>
                                Recognition Type
                              </Label>
                              <Select
                                value={recognitionFormData.type}
                                onValueChange={value =>
                                  setRecognitionFormData(prev => ({
                                    ...prev,
                                    type: value as
                                      | 'clap'
                                      | 'fire'
                                      | 'heart'
                                      | 'flex'
                                      | 'zap'
                                      | 'trophy',
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='clap'>👏 Clap</SelectItem>
                                  <SelectItem value='fire'>🔥 Fire</SelectItem>
                                  <SelectItem value='heart'>
                                    ❤️ Heart
                                  </SelectItem>
                                  <SelectItem value='flex'>💪 Flex</SelectItem>
                                  <SelectItem value='zap'>⚡ Zap</SelectItem>
                                  <SelectItem value='trophy'>
                                    🏆 Trophy
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor='recognition-message-create'>
                              Message (optional)
                            </Label>
                            <Textarea
                              id='recognition-message-create'
                              value={recognitionFormData.message}
                              onChange={e =>
                                setRecognitionFormData(prev => ({
                                  ...prev,
                                  message: e.target.value,
                                }))
                              }
                              placeholder='Add a personal message...'
                              className='min-h-[80px] w-full'
                              maxLength={200}
                            />
                            <p className='text-xs text-muted-foreground'>
                              {recognitionFormData.message.length}/200
                              characters
                            </p>
                          </div>

                          <div className='flex gap-2 pt-2'>
                            <Button
                              onClick={handleGiveRecognition}
                              disabled={
                                !recognitionFormData.recipientId ||
                                giveRecognitionMutation.isPending
                              }
                              className='flex-1'
                            >
                              {giveRecognitionMutation.isPending ? (
                                <>
                                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Heart className='mr-2 h-4 w-4' />
                                  Give Recognition
                                </>
                              )}
                            </Button>
                            <Button
                              variant='outline'
                              onClick={() => setShowRecognitionForm(false)}
                              disabled={giveRecognitionMutation.isPending}
                            >
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
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
