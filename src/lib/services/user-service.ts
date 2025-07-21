import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { logger } from '@/lib/logger';

// ============================================================================
// React Query Hooks for Caching
// ============================================================================

/**
 * React Query hook for user profile with caching
 */
export function useUserProfile(userId: string | null) {
  return useQuery({
    queryKey: ['user', 'profile', userId],
    queryFn: () => userService.getUserProfile(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * React Query hook for user goals with caching
 */
export function useUserGoals(userId: string | null) {
  return useQuery({
    queryKey: ['user', 'goals', userId],
    queryFn: () => userService.getUserGoals(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * React Query hook for schools list with caching
 */
export function useSchools() {
  return useQuery({
    queryKey: ['user', 'schools'],
    queryFn: () => userService.getSchools(),
    staleTime: 30 * 60 * 1000, // 30 minutes (rarely changes)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * React Query hook for sports list with caching
 */
export function useSports() {
  return useQuery({
    queryKey: ['user', 'sports'],
    queryFn: () => userService.getSports(),
    staleTime: 30 * 60 * 1000, // 30 minutes (rarely changes)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * React Query mutation for updating user profile with cache invalidation
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      profileData,
    }: {
      userId: string;
      profileData: Partial<UserProfile>;
    }) => userService.updateUserProfile(userId, profileData),
    onSuccess: (data, variables) => {
      // Invalidate related queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ['user', 'profile', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user', 'goals', variables.userId],
      });
    },
  });
}

/**
 * React Query mutation for updating user goals with cache invalidation
 */
export function useUpdateUserGoals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      goalType,
      value,
    }: {
      userId: string;
      goalType: 'athletic' | 'academic';
      value: string;
    }) => userService.updateUserGoals(userId, goalType, value),
    onSuccess: (data, variables) => {
      // Invalidate related queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ['user', 'goals', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user', 'profile', variables.userId],
      });
    },
  });
}

// ============================================================================
// Original Service Class
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
  phone?: string;
  school?: string;
  grade?: string;
  sport?: string;
  position?: string;
  athleticGoal?: string;
  academicGoal?: string;
  bio?: string;
  // Additional fields from old version
  age?: string;
  sleepHours?: number;
  studyHours?: number;
  activeHours?: number;
  stressLevel?: number;
  screenTime?: number;
  wearable?: string;
  coachName?: string;
  coachEmail?: string;
}

export interface UserFormData {
  id: string;
  name: string;
  age: string;
  email: string;
  phone: string;
  grade: string;
  sport?: {
    id: string;
    name: string;
  };
  team?: {
    id: string;
    name: string;
    sportID: string;
    schoolID: string;
  };
  athleticGoals: string;
  academicGoals: string;
  sleepHours: number;
  studyHours: number;
  activeHours: number;
  stress: number;
  screenTime: number;
  wearable: string;
  coachEmail?: string;
  coachName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserGoals {
  athletic: string;
  academic: string;
}

export interface School {
  id: string;
  name: string;
}

export interface Sport {
  id: string;
  name: string;
}

class UserService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('API request failed:', { endpoint, error });
      throw error;
    }
  }

  /**
   * Fetch user basic information
   */
  async getUserData(userId: string): Promise<{
    id: string;
    given_name: string;
    family_name: string;
    email: string;
    picture: string;
    phone_number: string | null;
  }> {
    return this.makeRequest(`/users/${userId}/data`);
  }

  /**
   * Fetch user form data (most recent)
   */
  async getUserForms(userId: string): Promise<UserFormData[]> {
    return this.makeRequest(`/users/${userId}/forms`);
  }

  /**
   * Fetch user goals
   */
  async getUserGoals(userId: string): Promise<UserGoals> {
    return this.makeRequest(`/users/${userId}/goals`);
  }

  /**
   * Update user goals
   */
  async updateUserGoals(
    userId: string,
    goalType: 'athletic' | 'academic',
    value: string
  ): Promise<{ success: boolean }> {
    return this.makeRequest(`/users/${userId}/goals`, {
      method: 'PUT',
      body: JSON.stringify({ goalType, value }),
    });
  }

  /**
   * Get comprehensive user profile data
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      // Fetch all user data in parallel
      const [userData, userForms, userGoals] = await Promise.allSettled([
        this.getUserData(userId),
        this.getUserForms(userId),
        this.getUserGoals(userId),
      ]);

      // Start with basic user data
      const profile: UserProfile = {
        id: userId,
        firstName:
          userData.status === 'fulfilled'
            ? userData.value.given_name
            : undefined,
        lastName:
          userData.status === 'fulfilled'
            ? userData.value.family_name
            : undefined,
        email:
          userData.status === 'fulfilled' ? userData.value.email : undefined,
        profileImage:
          userData.status === 'fulfilled' ? userData.value.picture : undefined,
        phone:
          userData.status === 'fulfilled'
            ? userData.value.phone_number || undefined
            : undefined,
      };

      // Debug logging for profile image
      if (userData.status === 'fulfilled') {
        logger.debug('User data loaded:', {
          picture: userData.value.picture,
          profileImage: profile.profileImage,
        });
      }

      // Add form data if available
      if (userForms.status === 'fulfilled' && userForms.value.length > 0) {
        const latestForm = userForms.value[0]; // Most recent form
        profile.school = latestForm.team?.schoolID || undefined;
        profile.grade =
          latestForm.grade !== 'placeholder' ? latestForm.grade : undefined;
        profile.sport = latestForm.sport?.id || undefined;
        profile.athleticGoal = latestForm.athleticGoals || undefined;
        profile.academicGoal = latestForm.academicGoals || undefined;
        // Additional fields from old version
        profile.age = latestForm.age || undefined;
        profile.sleepHours = latestForm.sleepHours || undefined;
        profile.studyHours = latestForm.studyHours || undefined;
        profile.activeHours = latestForm.activeHours || undefined;
        profile.stressLevel = latestForm.stress || undefined;
        profile.screenTime = latestForm.screenTime || undefined;
        profile.wearable = latestForm.wearable || undefined;
        profile.coachName = latestForm.coachName || undefined;
        profile.coachEmail = latestForm.coachEmail || undefined;
        // Note: position is not stored in the current schema, would need to be added
      }

      // Add goals if available
      if (userGoals.status === 'fulfilled') {
        if (!profile.athleticGoal) {
          profile.athleticGoal = userGoals.value.athletic;
        }
        if (!profile.academicGoal) {
          profile.academicGoal = userGoals.value.academic;
        }
      }

      return profile;
    } catch (error) {
      logger.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  /**
   * Fetch all schools
   */
  async getSchools(): Promise<School[]> {
    return this.makeRequest('/schools');
  }

  /**
   * Fetch all sports
   */
  async getSports(): Promise<Sport[]> {
    return this.makeRequest('/sports');
  }

  /**
   * Update user profile data
   */
  async updateUserProfile(
    userId: string,
    profileData: Partial<UserProfile>
  ): Promise<void> {
    const updates: Promise<any>[] = [];

    // Update goals if provided
    if (profileData.athleticGoal) {
      updates.push(
        this.updateUserGoals(userId, 'athletic', profileData.athleticGoal)
      );
    }

    if (profileData.academicGoal) {
      updates.push(
        this.updateUserGoals(userId, 'academic', profileData.academicGoal)
      );
    }

    // Update profile image if provided (including empty string to clear it)
    if (profileData.profileImage !== undefined) {
      updates.push(
        this.updateUserProfileImage(userId, profileData.profileImage)
      );
    }

    // Update form data if any form fields are provided
    const formDataFields = [
      'grade',
      'school',
      'sport',
      'age',
      'phone',
      'sleepHours',
      'studyHours',
      'activeHours',
      'stressLevel',
      'screenTime',
      'wearable',
      'coachName',
      'coachEmail',
    ];

    const hasFormData = formDataFields.some(
      field => profileData[field as keyof UserProfile] !== undefined
    );

    if (hasFormData) {
      const formData: any = {};
      formDataFields.forEach(field => {
        if (profileData[field as keyof UserProfile] !== undefined) {
          formData[field] = profileData[field as keyof UserProfile];
        }
      });

      updates.push(this.updateUserFormData(userId, formData));
    }

    try {
      await Promise.all(updates);
      logger.info('User profile updated successfully:', {
        userId,
        updates: updates.length,
      });
    } catch (error) {
      logger.error('Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile image
   */
  async updateUserProfileImage(
    userId: string,
    imageUrl: string | undefined
  ): Promise<{ success: boolean }> {
    return this.makeRequest(`/users/${userId}/profile-image`, {
      method: 'PUT',
      body: JSON.stringify({ imageUrl: imageUrl || '' }),
    });
  }

  /**
   * Update user form data (grade, school, sport, etc.)
   */
  async updateUserFormData(
    userId: string,
    formData: {
      grade?: string;
      school?: string;
      sport?: string;
      age?: string;
      phone?: string;
      sleepHours?: number;
      studyHours?: number;
      activeHours?: number;
      stressLevel?: number;
      screenTime?: number;
      wearable?: string;
      coachName?: string;
      coachEmail?: string;
    }
  ): Promise<{ success: boolean }> {
    return this.makeRequest(`/users/${userId}/form-data`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    });
  }
}

export const userService = new UserService();
