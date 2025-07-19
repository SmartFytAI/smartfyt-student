'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { UserProfile } from '@/lib/services/user-service';

interface UserAvatarProps {
  userId: string;
  onSignOut?: () => void;
}

export function UserAvatar({ userId, onSignOut }: UserAvatarProps) {
  const router = useRouter();
  const { profile, isLoading, error, updateProfile } = useUserProfile(userId);

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
  };

  const getUserInitials = () => {
    if (!profile?.firstName && !profile?.lastName) return 'U';
    return `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`.toUpperCase();
  };

  const getUserDisplayName = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (profile?.firstName) {
      return profile.firstName;
    }
    if (profile?.email) {
      return profile.email;
    }
    return 'User';
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='relative h-10 w-auto rounded-full p-0 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
          >
            <div className='flex items-center space-x-2 px-2 py-1'>
              <Avatar className='h-8 w-8 border-2 border-orange-500'>
                <AvatarImage src={profile?.profileImage} alt='Profile' />
                <AvatarFallback className='bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-semibold text-white'>
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <span className='hidden text-sm font-medium text-neutral-700 dark:text-neutral-300 sm:block'>
                {getUserDisplayName()}
              </span>
              <ChevronDown className='h-4 w-4 text-neutral-500' />
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className='mt-2 w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none text-neutral-900 dark:text-neutral-100'>
                {getUserDisplayName()}
              </p>
              {profile?.email && (
                <p className='text-xs leading-none text-neutral-500 dark:text-neutral-400'>
                  {profile.email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => router.push('/profile')}
            className='cursor-pointer transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
          >
            <User className='mr-2 h-4 w-4 text-orange-500' />
            <span className='text-neutral-700 dark:text-neutral-300'>
              Profile Settings
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleSignOut}
            className='cursor-pointer text-red-600 transition-colors hover:bg-neutral-100 focus:text-red-600 dark:text-red-400 dark:hover:bg-neutral-800 dark:focus:text-red-400'
          >
            <LogOut className='mr-2 h-4 w-4' />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
