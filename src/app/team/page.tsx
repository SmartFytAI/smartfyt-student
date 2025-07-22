'use client';

import {
  Target,
  Users,
  Plus,
  Star,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Heart,
  Award,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { AuthGuard } from '@/components/auth';
import { PageLayout } from '@/components/layout/page-layout';
import { TeamLeaderboardPage } from '@/components/team/team-leaderboard-page';
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
  useTeamChallenges,
  useTeamRecognitions,
  useUserRecognitionLimits,
  useCreateTeamChallenge,
  useGiveRecognition,
} from '@/hooks/use-team-challenges-api';
import { trackPageView } from '@/lib/analytics';
import { logger } from '@/lib/logger';

export default function TeamPage() {
  const { user } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(true);

  // Inline form states
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [showRecognitionForm, setShowRecognitionForm] = useState(false);

  // Form data states
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
  });

  const [recognitionFormData, setRecognitionFormData] = useState({
    recipientId: '',
    type: 'clap' as 'clap' | 'fire' | 'heart' | 'flex' | 'zap' | 'trophy',
    message: '',
  });

  // Use our new service layer for teams
  const {
    data: teamsResponse,
    isLoading: teamsLoading,
    error: teamsError,
  } = useUserTeams(user?.id || null);

  const teams = React.useMemo(
    () => teamsResponse?.data || [],
    [teamsResponse?.data]
  );

  // Auto-select first team if available
  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Get team data
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

  // Get user recognition limits
  const {
    data: recognitionLimitsResponse,
    isLoading: recognitionLimitsLoading,
  } = useUserRecognitionLimits(user?.id || null, new Date());

  // Mutations
  const createChallengeMutation = useCreateTeamChallenge();
  const giveRecognitionMutation = useGiveRecognition();

  // Loading and error states
  const isLoading =
    teamsLoading ||
    teamChallengesLoading ||
    teamRecognitionsLoading ||
    recognitionLimitsLoading;

  const error =
    teamsError?.message ||
    teamChallengesError?.message ||
    teamRecognitionsError?.message;

  const teamChallenges = teamChallengesResponse?.data || [];
  const teamRecognitions = teamRecognitionsResponse?.data || [];
  const recognitionLimits = recognitionLimitsResponse?.data;

  // Calculate stats
  const totalChallenges = teamChallenges.length;
  const activeChallenges = teamChallenges.filter(c => c.isActive).length;
  const completionRate =
    totalChallenges > 0 ? (activeChallenges / totalChallenges) * 100 : 0;

  const handleCreateChallenge = async () => {
    if (!selectedTeamId || !user?.id) return;

    try {
      const result = await createChallengeMutation.mutateAsync({
        title: challengeFormData.title,
        description: challengeFormData.description,
        type: challengeFormData.type,
        duration: challengeFormData.duration,
        teamId: selectedTeamId,
        userIds: [user.id], // For now, just include the creator
      });

      if (result.data) {
        setChallengeFormData({
          title: '',
          description: '',
          type: 'step_competition',
          duration: 7,
        });
        setShowChallengeForm(false);
        logger.info('Team challenge created successfully', {
          challengeId: result.data.id,
        });
      }
    } catch (error) {
      logger.error('Failed to create team challenge', { error });
    }
  };

  const handleGiveRecognition = async () => {
    if (!selectedTeamId || !user?.id || !recognitionFormData.recipientId)
      return;

    try {
      const result = await giveRecognitionMutation.mutateAsync({
        fromUserId: user.id,
        toUserId: recognitionFormData.recipientId,
        teamId: selectedTeamId,
        type: recognitionFormData.type,
        message: recognitionFormData.message,
      });

      if (result.data) {
        setRecognitionFormData({
          recipientId: '',
          type: 'clap',
          message: '',
        });
        setShowRecognitionForm(false);
        logger.info('Recognition given successfully', {
          recognitionId: result.data.id,
        });
      }
    } catch (error) {
      logger.error('Failed to give recognition', { error });
    }
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'step_competition':
        return <TrendingUp className='h-4 w-4' />;
      case 'workout':
        return <Target className='h-4 w-4' />;
      case 'habit':
        return <Star className='h-4 w-4' />;
      case 'skill':
        return <Award className='h-4 w-4' />;
      case 'team_building':
        return <Users className='h-4 w-4' />;
      default:
        return <Target className='h-4 w-4' />;
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'step_competition':
        return 'bg-blue-100 text-blue-800';
      case 'workout':
        return 'bg-green-100 text-green-800';
      case 'habit':
        return 'bg-purple-100 text-purple-800';
      case 'skill':
        return 'bg-orange-100 text-orange-800';
      case 'team_building':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        return 'bg-yellow-100 text-yellow-800';
      case 'fire':
        return 'bg-red-100 text-red-800';
      case 'heart':
        return 'bg-pink-100 text-pink-800';
      case 'flex':
        return 'bg-blue-100 text-blue-800';
      case 'zap':
        return 'bg-purple-100 text-purple-800';
      case 'trophy':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecognitionLimit = (type: string) => {
    if (!recognitionLimits) return 0;
    const limitField = `${type}sUsed` as keyof typeof recognitionLimits;
    return recognitionLimits[limitField] as number;
  };

  const canGiveRecognition = (type: string) => {
    const used = getRecognitionLimit(type);
    const maxLimit = 5; // Daily limit per type
    return used < maxLimit;
  };

  // Track team page view
  useEffect(() => {
    if (user?.id) {
      trackPageView('team', {
        user_id: user.id,
        teams_count: teams.length,
      });
    }
  }, [user?.id, teams.length]);

  if (isLoading) {
    return (
      <AuthGuard>
        <PageLayout
          title='Team'
          subtitle='Connect with your teammates and compete together'
        >
          <div className='space-y-6'>
            <div className='animate-pulse'>
              <div className='mb-4 h-8 w-1/4 rounded bg-gray-200'></div>
              <div className='h-4 w-1/2 rounded bg-gray-200'></div>
            </div>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className='h-48 animate-pulse rounded bg-gray-200'
                ></div>
              ))}
            </div>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <PageLayout
          title='Team'
          subtitle='Connect with your teammates and compete together'
        >
          <div className='rounded-lg border border-danger-200 bg-danger-50 p-4 shadow-sm'>
            <div className='flex items-center'>
              <div className='text-danger-600'>
                <svg
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-danger-800'>
                  Error Loading Teams
                </h3>
                <div className='mt-2 text-sm text-danger-700'>
                  <p>{error}</p>
                  <p>
                    Please try refreshing the page or contact support if the
                    problem persists.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (!teams.length) {
    return (
      <AuthGuard>
        <PageLayout
          title='Team'
          subtitle='Connect with your teammates and compete together'
        >
          <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
            <div className='flex items-center'>
              <div className='text-gray-600'>
                <svg
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-gray-900'>
                  No Teams Found
                </h3>
                <div className='mt-2 text-sm text-gray-500'>
                  <p>You&apos;re not currently part of any teams.</p>
                  <p>
                    Teams will appear here once you&apos;re added by your coach
                    or administrator.
                  </p>
                </div>
                <div className='mt-4 text-xs text-gray-400'>
                  <p>User ID: {user?.id || 'Not available'}</p>
                  <p>Email: {user?.email || 'Not available'}</p>
                </div>
              </div>
            </div>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PageLayout
        title='Team'
        subtitle='Connect with your teammates and compete together'
      >
        <div className='mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8'>
          {/* Team Selection */}
          <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
            <div className='flex-1'></div>
            <div className='flex items-center gap-4'>
              <Select
                value={selectedTeamId || ''}
                onValueChange={setSelectedTeamId}
              >
                <SelectTrigger className='w-48'>
                  <SelectValue placeholder='Select a team' />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Team Leaderboard */}
          <TeamLeaderboardPage
            userId={user?.id || ''}
            selectedTeamId={selectedTeamId}
            teams={teams}
          />

          {/* Team Challenges and Recognition Section */}
          <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>
              Team Activities
            </h3>

            {/* Overview Stats */}
            <Card className='mb-6'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center gap-2'>
                    <TrendingUp className='h-5 w-5' />
                    Overview
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                    >
                      {isOverviewExpanded ? (
                        <ChevronUp className='h-4 w-4' />
                      ) : (
                        <ChevronDown className='h-4 w-4' />
                      )}
                    </Button>
                  </CardTitle>
                </div>
              </CardHeader>
              {isOverviewExpanded && (
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {totalChallenges}
                      </div>
                      <div className='text-sm text-gray-600'>
                        Total Challenges
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-green-600'>
                        {activeChallenges}
                      </div>
                      <div className='text-sm text-gray-600'>
                        Active Challenges
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-purple-600'>
                        {completionRate.toFixed(0)}%
                      </div>
                      <div className='text-sm text-gray-600'>
                        Completion Rate
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue='challenges' className='space-y-4'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='challenges'>Team Challenges</TabsTrigger>
                <TabsTrigger value='recognition'>Recognition</TabsTrigger>
              </TabsList>

              {/* Team Challenges Tab */}
              <TabsContent value='challenges' className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-semibold'>Team Challenges</h3>
                  <Button
                    onClick={() => setShowChallengeForm(!showChallengeForm)}
                    variant={showChallengeForm ? 'outline' : 'default'}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    {showChallengeForm ? 'Cancel' : 'Create New Challenge'}
                  </Button>
                </div>

                {/* Create Challenge Form */}
                {showChallengeForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Create New Challenge</CardTitle>
                      <CardDescription>
                        Create a new team challenge to engage your teammates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div>
                          <Label htmlFor='challenge-title'>Title</Label>
                          <Input
                            id='challenge-title'
                            value={challengeFormData.title}
                            onChange={e =>
                              setChallengeFormData({
                                ...challengeFormData,
                                title: e.target.value,
                              })
                            }
                            placeholder='Enter challenge title'
                          />
                        </div>
                        <div>
                          <Label htmlFor='challenge-type'>Type</Label>
                          <Select
                            value={challengeFormData.type}
                            onValueChange={(value: string) =>
                              setChallengeFormData({
                                ...challengeFormData,
                                type: value as
                                  | 'step_competition'
                                  | 'workout'
                                  | 'habit'
                                  | 'skill'
                                  | 'team_building',
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='step_competition'>
                                Step Competition
                              </SelectItem>
                              <SelectItem value='workout'>Workout</SelectItem>
                              <SelectItem value='habit'>Habit</SelectItem>
                              <SelectItem value='skill'>Skill</SelectItem>
                              <SelectItem value='team_building'>
                                Team Building
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor='challenge-description'>
                          Description
                        </Label>
                        <Textarea
                          id='challenge-description'
                          value={challengeFormData.description}
                          onChange={e =>
                            setChallengeFormData({
                              ...challengeFormData,
                              description: e.target.value,
                            })
                          }
                          placeholder='Describe the challenge'
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor='challenge-duration'>
                          Duration (days)
                        </Label>
                        <Input
                          id='challenge-duration'
                          type='number'
                          value={challengeFormData.duration}
                          onChange={e =>
                            setChallengeFormData({
                              ...challengeFormData,
                              duration: parseInt(e.target.value) || 7,
                            })
                          }
                          min='1'
                          max='30'
                        />
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          onClick={handleCreateChallenge}
                          disabled={createChallengeMutation.isPending}
                        >
                          {createChallengeMutation.isPending
                            ? 'Creating...'
                            : 'Create Challenge'}
                        </Button>
                        <Button
                          variant='outline'
                          onClick={() => setShowChallengeForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Challenges List */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {teamChallenges.length === 0 ? (
                    <Card className='col-span-full'>
                      <CardContent className='py-8 text-center'>
                        <Target className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                        <h4 className='mb-2 text-lg font-semibold'>
                          No Team Challenges
                        </h4>
                        <p className='mb-4 text-gray-600'>
                          Create your first team challenge to get started!
                        </p>
                        <Button onClick={() => setShowChallengeForm(true)}>
                          <Plus className='mr-2 h-4 w-4' />
                          Create New Challenge
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    teamChallenges.map(challenge => (
                      <Card
                        key={challenge.id}
                        className='transition-shadow hover:shadow-md'
                      >
                        <CardHeader>
                          <div className='flex items-start justify-between'>
                            <div className='flex items-center gap-2'>
                              {getChallengeTypeIcon(challenge.type)}
                              <Badge
                                className={getChallengeTypeColor(
                                  challenge.type
                                )}
                              >
                                {challenge.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <Badge
                              variant={
                                challenge.isActive ? 'default' : 'secondary'
                              }
                            >
                              {challenge.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <CardTitle className='text-lg'>
                            {challenge.title}
                          </CardTitle>
                          <CardDescription>
                            {challenge.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className='space-y-2 text-sm text-gray-600'>
                            <div>Duration: {challenge.duration} days</div>
                            <div>
                              Created:{' '}
                              {new Date(
                                challenge.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Recognition Tab */}
              <TabsContent value='recognition' className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-semibold'>Team Recognition</h3>
                  <Button
                    onClick={() => setShowRecognitionForm(!showRecognitionForm)}
                    variant={showRecognitionForm ? 'outline' : 'default'}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    {showRecognitionForm ? 'Cancel' : 'Give Recognition'}
                  </Button>
                </div>

                {/* Give Recognition Form */}
                {showRecognitionForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Give Recognition</CardTitle>
                      <CardDescription>
                        Show appreciation to your teammates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div>
                          <Label htmlFor='recognition-recipient'>
                            Recipient
                          </Label>
                          <Select
                            value={recognitionFormData.recipientId}
                            onValueChange={value =>
                              setRecognitionFormData({
                                ...recognitionFormData,
                                recipientId: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Select a teammate' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='placeholder' disabled>
                                Team members not available
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor='recognition-type'>Type</Label>
                          <Select
                            value={recognitionFormData.type}
                            onValueChange={(value: string) =>
                              setRecognitionFormData({
                                ...recognitionFormData,
                                type: value as
                                  | 'clap'
                                  | 'fire'
                                  | 'heart'
                                  | 'flex'
                                  | 'zap'
                                  | 'trophy',
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='clap'>👏 Clap</SelectItem>
                              <SelectItem value='fire'>🔥 Fire</SelectItem>
                              <SelectItem value='heart'>❤️ Heart</SelectItem>
                              <SelectItem value='flex'>💪 Flex</SelectItem>
                              <SelectItem value='zap'>⚡ Zap</SelectItem>
                              <SelectItem value='trophy'>🏆 Trophy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor='recognition-message'>
                          Message (optional)
                        </Label>
                        <Textarea
                          id='recognition-message'
                          value={recognitionFormData.message}
                          onChange={e =>
                            setRecognitionFormData({
                              ...recognitionFormData,
                              message: e.target.value,
                            })
                          }
                          placeholder='Add a personal message'
                          rows={3}
                        />
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          onClick={handleGiveRecognition}
                          disabled={
                            giveRecognitionMutation.isPending ||
                            !recognitionFormData.recipientId ||
                            !canGiveRecognition(recognitionFormData.type)
                          }
                        >
                          {giveRecognitionMutation.isPending
                            ? 'Sending...'
                            : 'Give Recognition'}
                        </Button>
                        <Button
                          variant='outline'
                          onClick={() => setShowRecognitionForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recognition List */}
                <div className='space-y-4'>
                  {teamRecognitions.length === 0 ? (
                    <Card>
                      <CardContent className='py-8 text-center'>
                        <Heart className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                        <h4 className='mb-2 text-lg font-semibold'>
                          No Recognition Yet
                        </h4>
                        <p className='mb-4 text-gray-600'>
                          Start recognizing your teammates&apos; achievements!
                        </p>
                        <Button onClick={() => setShowRecognitionForm(true)}>
                          <Plus className='mr-2 h-4 w-4' />
                          Give Recognition
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    teamRecognitions.map(recognition => (
                      <Card
                        key={recognition.id}
                        className='transition-shadow hover:shadow-md'
                      >
                        <CardContent className='pt-6'>
                          <div className='flex items-start gap-4'>
                            <div className='flex-shrink-0'>
                              <span
                                className={getRecognitionColor(
                                  recognition.type
                                )}
                              >
                                {getRecognitionIcon(recognition.type)}
                              </span>
                            </div>
                            <div className='min-w-0 flex-1'>
                              <div className='mb-1 flex items-center gap-2'>
                                <span className='font-medium'>
                                  {recognition.fromUserId} →{' '}
                                  {recognition.toUserId}
                                </span>
                                <Badge variant='outline' className='text-xs'>
                                  {recognition.type}
                                </Badge>
                              </div>
                              {recognition.message && (
                                <p className='mb-2 text-sm text-gray-600'>
                                  {recognition.message}
                                </p>
                              )}
                              <div className='text-xs text-gray-500'>
                                {new Date(
                                  recognition.createdAt
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
