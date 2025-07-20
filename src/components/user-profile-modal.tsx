'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Save, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  athleticGoal: z
    .string()
    .min(10, 'Athletic goal must be at least 10 characters'),
  academicGoal: z
    .string()
    .min(10, 'Academic goal must be at least 10 characters'),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImage?: string;
    school?: string;
    grade?: string;
    sport?: string;
    position?: string;
    phone?: string;
    athleticGoal?: string;
    academicGoal?: string;
    bio?: string;
  };
  onSave?: (data: ProfileFormValues) => Promise<void>;
}

export function UserProfileModal({
  isOpen,
  onClose,
  user,
  onSave,
}: UserProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      school: user?.school || '',
      grade: user?.grade || '',
      sport: user?.sport || '',
      position: user?.position || '',
      phone: user?.phone || '',
      athleticGoal: user?.athleticGoal || '',
      academicGoal: user?.academicGoal || '',
      bio: user?.bio || '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!onSave) return;

    setIsLoading(true);
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold text-neutral-900 dark:text-neutral-100'>
            Profile Settings
          </DialogTitle>
          <DialogDescription className='text-neutral-600 dark:text-neutral-400'>
            Update your personal information and goals
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Profile Image Section */}
            <div className='flex flex-col items-center space-y-4'>
              <div className='relative'>
                <Avatar className='h-24 w-24 border-4 border-white shadow-lg'>
                  <AvatarImage src={profileImage} alt='Profile' />
                  <AvatarFallback className='bg-gradient-to-br from-athletic-orange to-athletic-orange/80 text-2xl font-bold text-white'>
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor='profile-image'
                  className='absolute -bottom-2 -right-2 cursor-pointer rounded-full bg-athletic-orange p-2 text-white shadow-lg transition-colors hover:bg-athletic-orange/90'
                >
                  <Camera className='h-4 w-4' />
                  <input
                    id='profile-image'
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>

            {/* Basic Information */}
            <div className='space-y-4'>
              <h3 className='border-b border-neutral-200 pb-2 text-lg font-semibold text-neutral-900 dark:border-neutral-700 dark:text-neutral-100'>
                Basic Information
              </h3>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter your first name' {...field} />
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
                        <Input placeholder='Enter your last name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='school'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter your school' {...field} />
                      </FormControl>
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='sport'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Sport</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., Football, Basketball'
                          {...field}
                        />
                      </FormControl>
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

              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter your phone number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Goals Section */}
            <div className='space-y-4'>
              <h3 className='border-b border-neutral-200 pb-2 text-lg font-semibold text-neutral-900 dark:border-neutral-700 dark:text-neutral-100'>
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
                        className='min-h-[100px]'
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
                        className='min-h-[100px]'
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

            {/* Bio Section */}
            <div className='space-y-4'>
              <h3 className='border-b border-neutral-200 pb-2 text-lg font-semibold text-neutral-900 dark:border-neutral-700 dark:text-neutral-100'>
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
                        className='min-h-[100px]'
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

            <DialogFooter className='flex flex-col gap-3 sm:flex-row'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                className='w-full sm:w-auto'
                disabled={isLoading}
              >
                <X className='mr-2 h-4 w-4' />
                Cancel
              </Button>
              <Button
                type='submit'
                className='w-full bg-athletic-orange text-white hover:bg-athletic-orange/90 sm:w-auto'
                disabled={isLoading}
              >
                <Save className='mr-2 h-4 w-4' />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
