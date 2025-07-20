'use client';

import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { logger } from '@/lib/logger';
import {
  JournalService,
  CreateJournalData,
} from '@/lib/services/journal-service';

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
  returnToView = 'list',
}: JournalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      logger.debug('📝 Submitting journal form:', {
        userId,
        title: formData.title,
      });

      // Include selected date if provided
      const journalData = {
        ...formData,
        createdAt: selectedDate ? selectedDate.toISOString() : undefined,
      };

      const newJournal = await JournalService.createJournal(journalData);

      logger.debug('✅ Journal created successfully:', {
        journalId: newJournal.id,
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

  const getStressLevelDescription = (level: number) => {
    if (level <= 2) return 'Feeling great!';
    if (level <= 4) return 'A bit stressed';
    if (level <= 6) return 'Moderately stressed';
    if (level <= 8) return 'Quite stressed';
    return 'Very stressed';
  };

  return (
    <Card className='mx-auto max-w-2xl'>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='sm' onClick={onCancel}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <CardTitle className='text-xl'>Create New Journal Entry</CardTitle>
            <div className='mt-1 flex items-center gap-2'>
              {selectedDate && (
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  For{' '}
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
              <span className='text-xs text-gray-500 dark:text-gray-500'>
                • Back to {returnToView === 'calendar' ? 'Calendar' : 'List'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Title */}
          <div className='space-y-2'>
            <Label htmlFor='title'>Title *</Label>
            <Input
              id='title'
              placeholder="What's on your mind today?"
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          {/* What Went Well */}
          <div className='space-y-2'>
            <Label htmlFor='wentWell'>What went well today?</Label>
            <Textarea
              id='wentWell'
              placeholder='Reflect on your successes, achievements, or positive moments...'
              value={formData.wentWell}
              onChange={e => handleInputChange('wentWell', e.target.value)}
              rows={3}
            />
          </div>

          {/* What Didn't Go Well */}
          <div className='space-y-2'>
            <Label htmlFor='notWell'>What didn&apos;t go well today?</Label>
            <Textarea
              id='notWell'
              placeholder='What challenges did you face? What could you improve?'
              value={formData.notWell}
              onChange={e => handleInputChange('notWell', e.target.value)}
              rows={3}
            />
          </div>

          {/* Goals */}
          <div className='space-y-2'>
            <Label htmlFor='goals'>Goals for tomorrow</Label>
            <Textarea
              id='goals'
              placeholder='What do you want to accomplish tomorrow?'
              value={formData.goals}
              onChange={e => handleInputChange('goals', e.target.value)}
              rows={3}
            />
          </div>

          {/* Metrics Grid */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Stress Level */}
            <div className='space-y-2'>
              <Label htmlFor='stress'>Stress Level (0-10)</Label>
              <Select
                value={(formData.stress ?? 0).toString()}
                onValueChange={value =>
                  handleInputChange('stress', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select stress level' />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                    <SelectItem key={level} value={level.toString()}>
                      {level} - {getStressLevelDescription(level)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sleep Hours */}
            <div className='space-y-2'>
              <Label htmlFor='sleepHours'>Sleep Hours</Label>
              <Input
                id='sleepHours'
                type='number'
                min='0'
                max='24'
                step='0.5'
                placeholder='0'
                value={formData.sleepHours}
                onChange={e =>
                  handleInputChange(
                    'sleepHours',
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>

            {/* Active Hours */}
            <div className='space-y-2'>
              <Label htmlFor='activeHours'>Active Hours</Label>
              <Input
                id='activeHours'
                type='number'
                min='0'
                max='24'
                step='0.5'
                placeholder='0'
                value={formData.activeHours}
                onChange={e =>
                  handleInputChange(
                    'activeHours',
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>

            {/* Study Hours */}
            <div className='space-y-2'>
              <Label htmlFor='studyHours'>Study Hours</Label>
              <Input
                id='studyHours'
                type='number'
                min='0'
                max='24'
                step='0.5'
                placeholder='0'
                value={formData.studyHours}
                onChange={e =>
                  handleInputChange(
                    'studyHours',
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>

            {/* Screen Time */}
            <div className='space-y-2'>
              <Label htmlFor='screenTime'>Screen Time (hours)</Label>
              <Input
                id='screenTime'
                type='number'
                min='0'
                max='24'
                step='0.5'
                placeholder='0'
                value={formData.screenTime}
                onChange={e =>
                  handleInputChange(
                    'screenTime',
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className='rounded-md border border-red-200 bg-red-50 p-3'>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className='flex gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting} className='flex-1'>
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
  );
}
