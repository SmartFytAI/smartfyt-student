'use client';

import { useState } from 'react';
import { UserAvatar } from '@/components/user-avatar';
import { UserProfileModal } from '@/components/user-profile-modal';
import { useUserProfile } from '@/hooks/use-user-profile';

export default function ProfileTestPage() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Use a test user ID - you can change this to test with different users
  const testUserId = '1'; // This should be a real user ID from your database

  const { profile, isLoading, error, updateProfile } =
    useUserProfile(testUserId);

  const handleSignOut = () => {
    console.log('Sign out clicked');
    // Add your sign out logic here
  };

  const handleProfileUpdate = async (data: any) => {
    console.log('Profile update:', data);
    await updateProfile(data);
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      {/* Header */}
      <div className='bg-white shadow-sm dark:bg-gray-800 dark:shadow-gray-900/20'>
        <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Profile Component Test
              </h1>
            </div>
            <div className='flex items-center gap-3'>
              <UserAvatar userId={testUserId} onSignOut={handleSignOut} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='space-y-6'>
          {/* Test Section */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/20'>
            <h2 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
              User Profile Components
            </h2>
            <p className='mb-4 text-gray-600 dark:text-gray-400'>
              This page demonstrates the UserAvatar and UserProfileModal
              components. Click on the avatar in the top right to see the
              dropdown menu.
            </p>

            <div className='space-y-4'>
              <div>
                <h3 className='text-md mb-2 font-medium text-gray-900 dark:text-white'>
                  Current User Data:
                </h3>
                <div className='rounded-md bg-gray-50 p-4 dark:bg-gray-700'>
                  <pre className='overflow-auto text-sm text-gray-700 dark:text-gray-300'>
                    {isLoading
                      ? 'Loading...'
                      : error
                        ? `Error: ${error}`
                        : JSON.stringify(profile, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className='text-md mb-2 font-medium text-gray-900 dark:text-white'>
                  Test Profile Modal:
                </h3>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className='rounded-md bg-athletic-orange px-4 py-2 text-white transition-colors hover:bg-athletic-orange/90'
                >
                  Open Profile Modal
                </button>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/20'>
            <h2 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
              Component Features
            </h2>
            <ul className='space-y-2 text-gray-600 dark:text-gray-400'>
              <li className='flex items-center'>
                <span className='mr-3 h-2 w-2 rounded-full bg-athletic-orange'></span>
                Avatar with user initials fallback
              </li>
              <li className='flex items-center'>
                <span className='mr-3 h-2 w-2 rounded-full bg-athletic-orange'></span>
                Dropdown menu with Profile and Sign Out options
              </li>
              <li className='flex items-center'>
                <span className='mr-3 h-2 w-2 rounded-full bg-athletic-orange'></span>
                Comprehensive profile form with validation
              </li>
              <li className='flex items-center'>
                <span className='mr-3 h-2 w-2 rounded-full bg-athletic-orange'></span>
                Profile image upload functionality
              </li>
              <li className='flex items-center'>
                <span className='mr-3 h-2 w-2 rounded-full bg-athletic-orange'></span>
                Orange and black accent colors as requested
              </li>
              <li className='flex items-center'>
                <span className='mr-3 h-2 w-2 rounded-full bg-athletic-orange'></span>
                Responsive design for mobile and desktop
              </li>
              <li className='flex items-center'>
                <span className='mr-3 h-2 w-2 rounded-full bg-athletic-orange'></span>
                Dark mode support
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Standalone Profile Modal for testing */}
      {profile && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={profile}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
}
