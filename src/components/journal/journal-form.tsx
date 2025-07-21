'use client';

import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';

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
import { Textarea } from '@/components/ui/textarea';
import { logger } from '@/lib/logger';
import {
  JournalService,
  CreateJournalData,
} from '@/lib/services/journal-service';

// Custom Time Slider Component
interface TimeSliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  icon: string;
  max?: number;
}

function TimeSlider({
  value,
  onChange,
  label,
  icon,
  max = 24,
}: TimeSliderProps) {
  const formatTime = (hours: number) => {
    if (hours === 0) return '0h';
    if (hours === 1) return '1h';
    return `${hours}h`;
  };

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <Label className='text-sm font-medium'>
          {icon} {label}
        </Label>
        <span className='text-sm font-semibold text-blue-600 dark:text-blue-400'>
          {formatTime(value)}
        </span>
      </div>
      <div className='space-y-2'>
        <input
          type='range'
          min='0'
          max={max}
          value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          className='h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700'
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(value / max) * 100}%, #e5e7eb ${(value / max) * 100}%, #e5e7eb 100%)`,
          }}
        />
        <div className='flex justify-between text-xs text-gray-500'>
          <span>0h</span>
          <span>{max}h</span>
        </div>
      </div>
    </div>
  );
}

// Custom Stress Level Component
interface StressLevelProps {
  value: number;
  onChange: (value: number) => void;
}

function StressLevel({ value, onChange }: StressLevelProps) {
  const getStressLevelDescription = (level: number) => {
    if (level <= 2) return 'Feeling great!';
    if (level <= 4) return 'A bit stressed';
    if (level <= 6) return 'Moderately stressed';
    if (level <= 8) return 'Quite stressed';
    return 'Very stressed';
  };

  const getStressColor = (level: number) => {
    if (level <= 2) return 'text-green-600 dark:text-green-400';
    if (level <= 4) return 'text-yellow-600 dark:text-yellow-400';
    if (level <= 6) return 'text-orange-600 dark:text-orange-400';
    if (level <= 8) return 'text-red-600 dark:text-red-400';
    return 'text-red-800 dark:text-red-300';
  };

  const getStressEmoji = (level: number) => {
    if (level <= 2) return '😊';
    if (level <= 4) return '😐';
    if (level <= 6) return '😟';
    if (level <= 8) return '😰';
    return '😱';
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Label className='text-base font-medium'>Stress Level 😰</Label>
        <div className='flex items-center gap-2'>
          <span className='text-lg'>{getStressEmoji(value)}</span>
          <span className={`text-sm font-semibold ${getStressColor(value)}`}>
            {value}/10
          </span>
        </div>
      </div>

      <div className='space-y-3'>
        <input
          type='range'
          min='0'
          max='10'
          value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          className='h-3 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700'
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 20%, #f59e0b 20%, #f59e0b 40%, #f97316 40%, #f97316 60%, #ef4444 60%, #ef4444 80%, #dc2626 80%, #dc2626 100%)`,
          }}
        />

        <div className='flex justify-between text-xs text-gray-500'>
          <span>😊 Low</span>
          <span>😐 Medium</span>
          <span>😰 High</span>
        </div>
      </div>

      {value > 0 && (
        <div
          className={`rounded-lg bg-gray-50 p-3 dark:bg-gray-800 ${getStressColor(value)}`}
        >
          <p className='text-sm font-medium'>
            {getStressLevelDescription(value)}
          </p>
        </div>
      )}
    </div>
  );
}

interface JournalFormProps {
  userId: string;
  selectedDate?: Date | null;
  onCancel: () => void;
  onSuccess: (journal: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  returnToView?: 'calendar' | 'list'; // Track where to return to
}

export function JournalForm({
  userId,
  selectedDate,
  onCancel,
  onSuccess,
}: JournalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingDate, setIsCheckingDate] = useState(false);

  // Default to today if no date is selected
  const effectiveDate = useMemo(
    () => selectedDate || new Date(),
    [selectedDate]
  );

  const [formData, setFormData] = useState<CreateJournalData>({
    userId,
    title: '',
    wentWell: '',
    notWell: '',
    goals: '',
    sleepHours: 0,
    activeHours: 0,
    stress: 0,
    screenTime: 0,
    studyHours: 0,
  });

  // Check if journal already exists for the selected date
  const checkExistingJournal = useCallback(
    async (date: Date): Promise<boolean> => {
      try {
        setIsCheckingDate(true);
        const hasJournal = await JournalService.hasJournalForDateEfficient(
          userId,
          date
        );
        logger.debug('📅 Checking for existing journal:', {
          date: date.toISOString(),
          hasJournal,
        });
        return hasJournal;
      } catch (error) {
        logger.error('❌ Error checking existing journal:', { error, date });
        return false;
      } finally {
        setIsCheckingDate(false);
      }
    },
    [userId]
  );

  // Only check for existing journal when form is submitted, not on every date change
  // This prevents the debouncing issue when typing

  const handleInputChange = (
    field: keyof CreateJournalData,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError(null); // Clear error when user starts typing
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }

    if ((formData.stress ?? 0) < 0 || (formData.stress ?? 0) > 10) {
      setError('Stress level must be between 0 and 10');
      return false;
    }

    if ((formData.sleepHours ?? 0) < 0 || (formData.sleepHours ?? 0) > 24) {
      setError('Sleep hours must be between 0 and 24');
      return false;
    }

    if ((formData.activeHours ?? 0) < 0 || (formData.activeHours ?? 0) > 24) {
      setError('Active hours must be between 0 and 24');
      return false;
    }

    if ((formData.studyHours ?? 0) < 0 || (formData.studyHours ?? 0) > 24) {
      setError('Study hours must be between 0 and 24');
      return false;
    }

    if ((formData.screenTime ?? 0) < 0 || (formData.screenTime ?? 0) > 24) {
      setError('Screen time must be between 0 and 24');
      return false;
    }

    // Check if there's already a journal for this date
    if (isCheckingDate) {
      setError('Please wait while we check for existing entries...');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Double-check for existing journal before submitting
    const hasExisting = await checkExistingJournal(effectiveDate);
    if (hasExisting) {
      setError(
        `You already have a journal entry for ${effectiveDate.toLocaleDateString()}. Please select a different date or edit your existing entry.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      logger.debug('📝 Submitting journal form:', {
        userId,
        title: formData.title,
        date: effectiveDate.toISOString(),
      });

      // Use the effective date (today if no date selected)
      const journalData = {
        ...formData,
        createdAt: effectiveDate.toISOString(),
      };

      const newJournal = await JournalService.createJournal(journalData);

      logger.debug('✅ Journal created successfully:', {
        journalId: newJournal.id,
        date: effectiveDate.toISOString(),
      });

      onSuccess(newJournal);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create journal';
      logger.error('❌ Error creating journal:', { error: err, formData });
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='sm' onClick={onCancel}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Create New Journal Entry
            </h1>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {isCheckingDate ? (
                <span className='flex items-center gap-2'>
                  <Loader2 className='h-3 w-3 animate-spin' />
                  Checking for existing entries...
                </span>
              ) : (
                <>
                  For{' '}
                  {effectiveDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {!selectedDate && ' (Today)'}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <BookOpen className='h-5 w-5 text-blue-500' />
              <CardTitle>Daily Reflection</CardTitle>
            </div>
            <CardDescription>
              Take a moment to reflect on your day and track your progress
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Title */}
              <div className='space-y-2'>
                <Label htmlFor='title' className='text-base font-medium'>
                  What&apos;s on your mind today? *
                </Label>
                <Input
                  id='title'
                  placeholder='Give your journal entry a title...'
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  required
                  className='text-base'
                />
              </div>

              {/* Reflection Sections */}
              <div className='grid gap-6 md:grid-cols-1'>
                {/* What Went Well */}
                <div className='space-y-2'>
                  <Label
                    htmlFor='wentWell'
                    className='flex items-center gap-2 text-base font-medium'
                  >
                    <TrendingUp className='h-4 w-4 text-green-600' />
                    What went well today?
                  </Label>
                  <Textarea
                    id='wentWell'
                    placeholder='Reflect on your successes, achievements, or positive moments...'
                    value={formData.wentWell}
                    onChange={e =>
                      handleInputChange('wentWell', e.target.value)
                    }
                    rows={4}
                    className='select-text text-base'
                  />
                </div>

                {/* What Didn't Go Well */}
                <div className='space-y-2'>
                  <Label htmlFor='notWell' className='text-base font-medium'>
                    What didn&apos;t go well today?
                  </Label>
                  <Textarea
                    id='notWell'
                    placeholder='What challenges did you face? What could you improve?'
                    value={formData.notWell}
                    onChange={e => handleInputChange('notWell', e.target.value)}
                    rows={4}
                    className='select-text text-base'
                  />
                </div>

                {/* Goals */}
                <div className='space-y-2'>
                  <Label
                    htmlFor='goals'
                    className='flex items-center gap-2 text-base font-medium'
                  >
                    <Target className='h-4 w-4 text-blue-600' />
                    Goals for tomorrow
                  </Label>
                  <Textarea
                    id='goals'
                    placeholder='What do you want to accomplish tomorrow? Set specific, achievable goals...'
                    value={formData.goals}
                    onChange={e => handleInputChange('goals', e.target.value)}
                    rows={4}
                    className='select-text text-base'
                  />
                </div>
              </div>

              {/* Daily Metrics */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Daily Metrics
                </h3>

                <div className='grid gap-6 sm:grid-cols-2'>
                  {/* Sleep Hours */}
                  <TimeSlider
                    value={formData.sleepHours ?? 0}
                    onChange={value => handleInputChange('sleepHours', value)}
                    label='Sleep Hours'
                    icon='💤'
                  />

                  {/* Active Hours */}
                  <TimeSlider
                    value={formData.activeHours ?? 0}
                    onChange={value => handleInputChange('activeHours', value)}
                    label='Active Hours'
                    icon='🏃'
                  />

                  {/* Study Hours */}
                  <TimeSlider
                    value={formData.studyHours ?? 0}
                    onChange={value => handleInputChange('studyHours', value)}
                    label='Study Hours'
                    icon='📚'
                  />

                  {/* Screen Time */}
                  <TimeSlider
                    value={formData.screenTime ?? 0}
                    onChange={value => handleInputChange('screenTime', value)}
                    label='Screen Time'
                    icon='📱'
                  />
                </div>

                {/* Stress Level */}
                <StressLevel
                  value={formData.stress ?? 0}
                  onChange={value => handleInputChange('stress', value)}
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className='rounded-lg bg-red-50 p-4 dark:bg-red-900/20'>
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className='flex justify-end gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onCancel}
                  disabled={isSubmitting || isCheckingDate}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={isSubmitting || isCheckingDate || !!error}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className='mr-2 h-4 w-4' />
                      Save Journal Entry
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
