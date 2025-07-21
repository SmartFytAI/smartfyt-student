'use client';

import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';
import {
  User,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  CheckCircle,
  WifiOff,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

import { CardErrorBoundary } from '@/components/error/error-boundary';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserProfile } from '@/hooks/use-user-profile';
import { ErrorHandler } from '@/lib/error-handler';
import { useComponentLoading, LoadingIds } from '@/lib/loading-manager';
import { logger } from '@/lib/logger';
import { handleLogoutCacheClear } from '@/utils/cache-utils';

interface WearableStatus {
  connected: boolean;
  provider?: string;
  lastSync?: Date;
  isConnecting: boolean;
}

interface UserAvatarProps {
  userId: string;
  onSignOut?: () => void;
  wearableStatus?: WearableStatus;
  onConnectWearable?: () => void;
}

function UserAvatarContent({
  userId,
  onSignOut,
  wearableStatus = { connected: false, isConnecting: false },
  onConnectWearable,
}: UserAvatarProps) {
  const router = useRouter();
  const { profile, isLoading: isProfileLoading } = useUserProfile(userId);
  const { setTheme, theme } = useTheme();

  // Loading states for user avatar operations
  const {
    isLoading: isLogoutLoading,
    startLoading: startLogoutLoading,
    stopLoading: stopLogoutLoading,
  } = useComponentLoading(LoadingIds.AUTH_LOGOUT);
  const {
    isLoading: isWearableConnecting,
    startLoading: startWearableLoading,
    stopLoading: stopWearableLoading,
  } = useComponentLoading(LoadingIds.HEALTH_SYNC);

  const handleSignOut = async () => {
    try {
      startLogoutLoading('Signing out...');
      logger.debug('🚪 Logout initiated - clearing caches');
      await handleLogoutCacheClear();
      logger.debug('✅ Cache clearing completed');

      // Call the parent's onSignOut if provided
      if (onSignOut) {
        onSignOut();
      }
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error, {
        userId,
        component: 'UserAvatar',
        action: 'logout',
      });
      ErrorHandler.logError(appError, {
        userId,
        component: 'UserAvatar',
        action: 'logout',
      });
      logger.error('❌ Error clearing caches on logout:', error);
    } finally {
      stopLogoutLoading();
    }
  };

  const getUserInitials = () => {
    if (isProfileLoading) return '';
    if (!profile?.firstName && !profile?.lastName) return 'U';
    return `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`.toUpperCase();
  };

  const getUserDisplayName = () => {
    if (isProfileLoading) return '';
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

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleConnectWearable = async () => {
    try {
      startWearableLoading('Connecting wearable...');
      logger.debug('🔗 Wearable connection initiated');

      if (onConnectWearable) {
        await onConnectWearable();
      }
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error, {
        userId,
        component: 'UserAvatar',
        action: 'connect-wearable',
      });
      ErrorHandler.logError(appError, {
        userId,
        component: 'UserAvatar',
        action: 'connect-wearable',
      });
      logger.error('❌ Error connecting wearable:', error);
    } finally {
      stopWearableLoading();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            disabled={isProfileLoading}
            className='relative h-10 w-auto rounded-full p-0 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
          >
            <div className='flex items-center space-x-2 px-2 py-1'>
              <Avatar className='h-8 w-8 border-2 border-primary-500'>
                {isProfileLoading ? (
                  <div className='flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700'>
                    <Loader2 className='h-3 w-3 animate-spin text-gray-500' />
                  </div>
                ) : (
                  <>
                    <AvatarImage src={profile?.profileImage} alt='Profile' />
                    <AvatarFallback className='bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-semibold text-white'>
                      {getUserInitials()}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <span className='hidden text-sm font-medium text-neutral-700 dark:text-neutral-300 sm:block'>
                {isProfileLoading ? (
                  <span className='text-gray-400 dark:text-gray-500'>
                    Loading...
                  </span>
                ) : (
                  getUserDisplayName()
                )}
              </span>
              <ChevronDown className='h-4 w-4 text-neutral-500' />
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className='mt-2 w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none text-neutral-900 dark:text-neutral-100'>
                {isProfileLoading ? 'Loading...' : getUserDisplayName()}
              </p>
              {!isProfileLoading && profile?.email && (
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
            <User className='mr-2 h-4 w-4 text-primary-500' />
            <span className='text-neutral-700 dark:text-neutral-300'>
              Profile Settings
            </span>
          </DropdownMenuItem>

          {/* Wearable Status */}
          <DropdownMenuItem
            onClick={handleConnectWearable}
            disabled={isWearableConnecting || wearableStatus.isConnecting}
            className='cursor-pointer transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
          >
            <div className='flex w-full items-center space-x-2'>
              {isWearableConnecting || wearableStatus.isConnecting ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : wearableStatus.connected ? (
                <CheckCircle className='mr-2 h-4 w-4 text-success-600' />
              ) : (
                <WifiOff className='mr-2 h-4 w-4 text-gray-400' />
              )}
              <div className='min-w-0 flex-1'>
                {wearableStatus.connected ? (
                  <div>
                    <p className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
                      Connected to {wearableStatus.provider || 'Wearable'}
                    </p>
                    {wearableStatus.lastSync && (
                      <p className='text-xs text-neutral-500 dark:text-neutral-400'>
                        Last sync: {formatDate(wearableStatus.lastSync)}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className='text-sm text-neutral-700 dark:text-neutral-300'>
                    Connect Wearable
                  </span>
                )}
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Theme Toggle */}
          <DropdownMenuItem
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className='cursor-pointer transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
          >
            {theme === 'dark' ? (
              <>
                <Sun className='mr-2 h-4 w-4 text-warning-500' />
                <span className='text-neutral-700 dark:text-neutral-300'>
                  Light Mode
                </span>
              </>
            ) : (
              <>
                <Moon className='mr-2 h-4 w-4 text-secondary-500' />
                <span className='text-neutral-700 dark:text-neutral-300'>
                  Dark Mode
                </span>
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <LogoutLink onClick={handleSignOut}>
            <DropdownMenuItem
              disabled={isLogoutLoading}
              className='cursor-pointer text-danger-600 transition-colors hover:bg-neutral-100 focus:text-danger-600 dark:text-danger-400 dark:hover:bg-neutral-800 dark:focus:text-danger-400'
            >
              {isLogoutLoading ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <LogOut className='mr-2 h-4 w-4' />
              )}
              <span>{isLogoutLoading ? 'Signing out...' : 'Sign Out'}</span>
            </DropdownMenuItem>
          </LogoutLink>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function UserAvatar({
  userId,
  onSignOut,
  wearableStatus = { connected: false, isConnecting: false },
  onConnectWearable,
}: UserAvatarProps) {
  return (
    <CardErrorBoundary
      fallback={
        <div className='flex items-center space-x-2 px-2 py-1'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700'>
            <Loader2 className='h-4 w-4 animate-spin text-gray-400' />
          </div>
          <span className='hidden text-sm font-medium text-gray-400 dark:text-gray-500 sm:block'>
            Loading...
          </span>
          <ChevronDown className='h-4 w-4 text-gray-400' />
        </div>
      }
    >
      <UserAvatarContent
        userId={userId}
        onSignOut={onSignOut}
        wearableStatus={wearableStatus}
        onConnectWearable={onConnectWearable}
      />
    </CardErrorBoundary>
  );
}
