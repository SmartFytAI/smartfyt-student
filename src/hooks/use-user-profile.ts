import { useState, useEffect, useCallback } from 'react';
import {
  userService,
  UserProfile,
  School,
  Sport,
} from '@/lib/services/user-service';
import { logger } from '@/lib/logger';

interface UseUserProfileReturn {
  profile: UserProfile | null;
  schools: School[];
  sports: Sport[];
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export function useUserProfile(userId: string): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      logger.debug('Fetching user profile and data:', { userId });
      const [userProfile, schoolsData, sportsData] = await Promise.all([
        userService.getUserProfile(userId),
        userService.getSchools(),
        userService.getSports(),
      ]);

      setProfile(userProfile);
      setSchools(schoolsData);
      setSports(sportsData);
      logger.debug('User profile and data fetched successfully:', {
        userId,
        profile: userProfile,
        schoolsCount: schoolsData.length,
        sportsCount: sportsData.length,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch user profile';
      setError(errorMessage);
      logger.error('Failed to fetch user profile:', { userId, error: err });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      try {
        logger.debug('Updating user profile:', { userId, data });
        await userService.updateUserProfile(userId, data);

        // Refresh the profile to get updated data
        await fetchProfile();

        logger.debug('User profile updated successfully:', { userId });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update user profile';
        logger.error('Failed to update user profile:', { userId, error: err });
        throw new Error(errorMessage);
      }
    },
    [userId, fetchProfile]
  );

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  // Fetch profile on mount and when userId changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    schools,
    sports,
    isLoading,
    error,
    refreshProfile,
    updateProfile,
  };
}
