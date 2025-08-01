'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Save, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { AuthGuard } from '@/components/auth';
import { PageLayout } from '@/components/layout/page-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { logger } from '@/lib/logger';
import {
  useUserProfile,
  useSchools,
  useSports,
  useUpdateUserProfile,
} from '@/lib/services/user-service';

// Profile form schema
const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  school: z.string().min(1, 'School is required'),
  grade: z.string().min(1, 'Grade is required'),
  sport: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
  profileImageUrl: z.string().optional(),
  athleticGoal: z
    .string()
    .min(10, 'Athletic goal must be at least 10 characters'),
  academicGoal: z
    .string()
    .min(10, 'Academic goal must be at least 10 characters'),
  bio: z.string().optional(),
  // Additional fields from old version
  age: z.string().optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  studyHours: z.number().min(0).max(24).optional(),
  activeHours: z.number().min(0).max(24).optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  screenTime: z.number().min(0).max(24).optional(),
  wearable: z.string().optional(),
  coachName: z.string().optional(),
  coachEmail: z.string().email().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | undefined>();

  // Use React Query hooks for data fetching with caching
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useUserProfile(user?.id || null);

  const {
    data: schools = [],
    isLoading: schoolsLoading,
    error: schoolsError,
  } = useSchools();

  const {
    data: sports = [],
    isLoading: sportsLoading,
    error: sportsError,
  } = useSports();

  const updateProfileMutation = useUpdateUserProfile();

  const isLoading = profileLoading || schoolsLoading || sportsLoading;
  const error = profileError || schoolsError || sportsError;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      school: '',
      grade: '',
      sport: '',
      position: '',
      phone: '',
      profileImageUrl: '',
      athleticGoal: '',
      academicGoal: '',
      bio: '',
      age: '',
      sleepHours: 7,
      studyHours: 3,
      activeHours: 2,
      stressLevel: 5,
      screenTime: 4,
      wearable: '',
      coachName: '',
      coachEmail: '',
    },
  });

  // Update form when profile data loads
  React.useEffect(() => {
    if (profile && !profileLoading && schools.length > 0 && sports.length > 0) {
      const formData = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        school: profile.school || '',
        grade: profile.grade || '',
        sport: profile.sport || '',
        position: profile.position || '',
        phone: profile.phone || '',
        profileImageUrl: profile.profileImage || '',
        athleticGoal: profile.athleticGoal || '',
        academicGoal: profile.academicGoal || '',
        bio: profile.bio || '',
        age: profile.age || '',
        sleepHours: profile.sleepHours || 7,
        studyHours: profile.studyHours || 3,
        activeHours: profile.activeHours || 2,
        stressLevel: profile.stressLevel || 5,
        screenTime: profile.screenTime || 4,
        wearable: profile.wearable || '',
        coachName: profile.coachName || '',
        coachEmail: profile.coachEmail || '',
      };

      form.reset(formData);
      setProfileImage(profile.profileImage || '');

      // Force set the values after reset to ensure they're applied
      setTimeout(() => {
        form.setValue('school', formData.school);
        form.setValue('sport', formData.sport);
      }, 100);
    }
  }, [profile, profileLoading, schools, sports, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      // Map form data to profile data
      const profileData = {
        ...data,
        profileImage: data.profileImageUrl, // Map the form field to the profile field
      };

      await updateProfileMutation.mutateAsync({
        userId: user.id,
        profileData: profileData,
      });
      logger.info('Profile updated successfully');
      // Optionally redirect back to dashboard
      router.push('/dashboard');
    } catch (error) {
      logger.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserInitials = () => {
    if (!profile?.firstName && !profile?.lastName) return 'U';
    return `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`.toUpperCase();
  };

  // Show loading state
  if (isLoading) {
    return (
      <AuthGuard>
        <PageLayout title='Profile' subtitle='Manage your account settings'>
          <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
            <div className='flex items-center justify-center py-12'>
              <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent'></div>
            </div>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  // Show error state
  if (error) {
    return (
      <AuthGuard>
        <PageLayout title='Profile' subtitle='Manage your account settings'>
          <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
            <div className='rounded-lg border border-danger-200 bg-danger-50 p-6 text-center dark:border-danger-700 dark:bg-danger-900/20'>
              <div className='mb-4 text-4xl'>⚠️</div>
              <h3 className='mb-2 text-lg font-semibold text-danger-800 dark:text-danger-200'>
                Unable to Load Profile
              </h3>
              <p className='text-danger-600 dark:text-danger-300'>
                {error instanceof Error
                  ? error.message
                  : 'An error occurred while loading your profile'}
              </p>
            </div>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PageLayout
        title='Profile Settings'
        subtitle='Manage your account and preferences'
      >
        {/* Mobile-first content */}
        <div className='mx-auto max-w-2xl px-4 py-6'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Profile Image Section - Mobile optimized */}
              <div className='flex flex-col items-center space-y-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800'>
                <div className='relative'>
                  <Avatar className='h-20 w-20 border-4 border-white shadow-lg'>
                    <AvatarImage
                      src={profileImage || undefined}
                      alt='Profile'
                    />
                    <AvatarFallback className='bg-gradient-to-br from-orange-500 to-orange-600 text-2xl font-bold text-white'>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className='w-full text-center'>
                  <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    {profile?.firstName} {profile?.lastName}
                  </h2>
                  <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
                    Update your profile information
                  </p>

                  {/* Profile Image URL Input */}
                  <FormField
                    control={form.control}
                    name='profileImageUrl'
                    render={({ field }) => (
                      <FormItem className='w-full'>
                        <FormLabel>Profile Image URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter image URL (e.g., https://example.com/image.jpg)'
                            {...field}
                            onChange={e => {
                              field.onChange(e);
                              setProfileImage(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormDescription />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Basic Information - Mobile optimized */}
              <div className='space-y-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800'>
                <div className='mb-4 flex items-center gap-2'>
                  <User className='h-5 w-5 text-primary-500' />
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    Basic Information
                  </h3>
                </div>

                <div className='grid grid-cols-1 gap-4'>
                  <FormField
                    control={form.control}
                    name='firstName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter your first name'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='lastName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter your last name'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='Enter your email'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter your phone number'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='age'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='Enter your age'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* School & Sports - Mobile optimized */}
              <div className='space-y-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  School & Sports
                </h3>

                <div className='grid grid-cols-1 gap-4'>
                  <FormField
                    control={form.control}
                    name='school'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School</FormLabel>
                        <Select
                          key={`school-${schools.length}-${field.value}`}
                          onValueChange={field.onChange}
                          value={field.value ?? ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select your school'>
                                {field.value &&
                                  schools.find(s => s.id === field.value)?.name}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {schools.map(school => (
                              <SelectItem key={school.id} value={school.id}>
                                {school.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='grade'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade</FormLabel>
                        <Select
                          key={`grade-${field.value}`}
                          onValueChange={field.onChange}
                          value={field.value ?? ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select your grade' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='9'>9th Grade</SelectItem>
                            <SelectItem value='10'>10th Grade</SelectItem>
                            <SelectItem value='11'>11th Grade</SelectItem>
                            <SelectItem value='12'>12th Grade</SelectItem>
                            <SelectItem value='college'>College</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='sport'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Sport</FormLabel>
                        <Select
                          key={`sport-${sports.length}-${field.value}`}
                          onValueChange={field.onChange}
                          value={field.value ?? ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select your sport'>
                                {field.value &&
                                  sports.find(s => s.id === field.value)?.name}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sports.map(sport => (
                              <SelectItem key={sport.id} value={sport.id}>
                                {sport.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='position'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., Quarterback, Point Guard'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Lifestyle Information - Mobile optimized */}
              <div className='space-y-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Daily Habits
                </h3>

                <div className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='sleepHours'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sleep Hours: {field.value}h</FormLabel>
                        <FormControl>
                          <input
                            type='range'
                            min='3'
                            max='12'
                            step='0.5'
                            value={field.value}
                            onChange={e =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            className='h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700'
                          />
                        </FormControl>
                        <FormDescription>
                          How many hours do you typically sleep per night?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='studyHours'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Study Hours: {field.value}h</FormLabel>
                        <FormControl>
                          <input
                            type='range'
                            min='0'
                            max='10'
                            step='0.5'
                            value={field.value}
                            onChange={e =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            className='h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700'
                          />
                        </FormControl>
                        <FormDescription>
                          How many hours do you typically study per day?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='activeHours'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Active Hours: {field.value}h</FormLabel>
                        <FormControl>
                          <input
                            type='range'
                            min='0'
                            max='8'
                            step='0.5'
                            value={field.value}
                            onChange={e =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            className='h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700'
                          />
                        </FormControl>
                        <FormDescription>
                          How many hours are you typically active/exercising per
                          day?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='stressLevel'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stress Level: {field.value}/10</FormLabel>
                        <FormControl>
                          <input
                            type='range'
                            min='1'
                            max='10'
                            step='1'
                            value={field.value}
                            onChange={e =>
                              field.onChange(parseInt(e.target.value))
                            }
                            className='h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700'
                          />
                        </FormControl>
                        <FormDescription>
                          How would you rate your typical stress level?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='screenTime'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Screen Time: {field.value}h</FormLabel>
                        <FormControl>
                          <input
                            type='range'
                            min='0'
                            max='16'
                            step='0.5'
                            value={field.value}
                            onChange={e =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            className='h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700'
                          />
                        </FormControl>
                        <FormDescription>
                          How many hours do you typically spend on screens per
                          day?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='wearable'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wearable Device (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., Apple Watch, Fitbit, Garmin'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          What wearable device do you use to track your health?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Coach Information - Mobile optimized */}
              <div className='space-y-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Coach Information (Optional)
                </h3>

                <div className='grid grid-cols-1 gap-4'>
                  <FormField
                    control={form.control}
                    name='coachName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coach Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your coach's name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='coachEmail'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coach Email</FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder="Enter your coach's email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Goals - Mobile optimized */}
              <div className='space-y-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Your Goals
                </h3>

                <FormField
                  control={form.control}
                  name='athleticGoal'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Athletic Goal</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Describe your athletic goals for this season...'
                          className='min-h-[100px] select-text resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        What do you want to achieve in your sport this season?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='academicGoal'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic Goal</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Describe your academic goals...'
                          className='min-h-[100px] select-text resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        What do you want to achieve academically this year?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Bio - Mobile optimized */}
              <div className='space-y-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  About You
                </h3>

                <FormField
                  control={form.control}
                  name='bio'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Tell us a bit about yourself...'
                          className='min-h-[100px] select-text resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Share something about yourself, your interests, or what
                        motivates you.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Save Button - Mobile optimized */}
              <div className='sticky bottom-4 mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
                <Button
                  type='submit'
                  className='h-12 w-full bg-primary-500 text-lg font-semibold text-white shadow-md hover:bg-primary-600'
                  disabled={isSubmitting}
                >
                  <Save className='mr-2 h-5 w-5' />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
