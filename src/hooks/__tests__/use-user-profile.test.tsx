import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/services/user-service', () => ({
  userService: {
    getUserProfile: vi.fn(),
    getSchools: vi.fn(),
    getSports: vi.fn(),
    updateUserProfile: vi.fn(),
  },
}));
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

import { useUserProfile } from '../use-user-profile';
import { userService, UserProfile } from '@/lib/services/user-service';
import { School, Sport } from '@/types';

describe('useUserProfile', () => {
  const userId = 'user-123';
  const mockUserService = vi.mocked(userService);

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with loading state', () => {
    mockUserService.getUserProfile.mockResolvedValue({
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      school: 'High School',
      grade: '12',
      sleepHours: 8,
      studyHours: 4,
      activeHours: 2,
      stressLevel: 5,
      sport: 'Football',
      wearable: 'Apple Watch',
      screenTime: 3,
      athleticGoal: 'Win championship',
      academicGoal: 'Get into college',
      coachName: 'Coach Smith',
      coachEmail: 'coach@school.com',
    });
    mockUserService.getSchools.mockResolvedValue([]);
    mockUserService.getSports.mockResolvedValue([]);

    const { result } = renderHook(() => useUserProfile(userId), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should load user profile successfully', async () => {
    const mockProfile: UserProfile = {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      school: 'High School',
      grade: '12',
      sleepHours: 8,
      studyHours: 4,
      activeHours: 2,
      stressLevel: 5,
      sport: 'Football',
      wearable: 'Apple Watch',
      screenTime: 3,
      athleticGoal: 'Win championship',
      academicGoal: 'Get into college',
      coachName: 'Coach Smith',
      coachEmail: 'coach@school.com',
    };

    const mockSchools: School[] = [
      { id: 'school-1', name: 'High School' },
      { id: 'school-2', name: 'Middle School' },
    ];

    const mockSports: Sport[] = [
      { id: 'sport-1', name: 'Football' },
      { id: 'sport-2', name: 'Basketball' },
    ];

    mockUserService.getUserProfile.mockResolvedValue(mockProfile);
    mockUserService.getSchools.mockResolvedValue(mockSchools);
    mockUserService.getSports.mockResolvedValue(mockSports);

    const { result } = renderHook(() => useUserProfile(userId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.schools).toEqual(mockSchools);
    expect(result.current.sports).toEqual(mockSports);
    expect(result.current.error).toBeNull();
  });

  it('should handle profile loading error', async () => {
    const error = new Error('Failed to fetch profile');
    mockUserService.getUserProfile.mockRejectedValue(error);
    mockUserService.getSchools.mockResolvedValue([]);
    mockUserService.getSports.mockResolvedValue([]);

    const { result } = renderHook(() => useUserProfile(userId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch profile');
    expect(result.current.profile).toBeNull();
  });

  it('should handle schools loading error', async () => {
    const mockProfile: UserProfile = {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      school: 'High School',
      grade: '12',
      sleepHours: 8,
      studyHours: 4,
      activeHours: 2,
      stressLevel: 5,
      sport: 'Football',
      wearable: 'Apple Watch',
      screenTime: 3,
      athleticGoal: 'Win championship',
      academicGoal: 'Get into college',
      coachName: 'Coach Smith',
      coachEmail: 'coach@school.com',
    };

    const error = new Error('Failed to fetch schools');
    mockUserService.getUserProfile.mockResolvedValue(mockProfile);
    mockUserService.getSchools.mockRejectedValue(error);
    mockUserService.getSports.mockResolvedValue([]);

    const { result } = renderHook(() => useUserProfile(userId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch schools');
    expect(result.current.profile).toBeNull();
    expect(result.current.schools).toEqual([]);
  });

  it('should handle sports loading error', async () => {
    const mockProfile: UserProfile = {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      school: 'High School',
      grade: '12',
      sleepHours: 8,
      studyHours: 4,
      activeHours: 2,
      stressLevel: 5,
      sport: 'Football',
      wearable: 'Apple Watch',
      screenTime: 3,
      athleticGoal: 'Win championship',
      academicGoal: 'Get into college',
      coachName: 'Coach Smith',
      coachEmail: 'coach@school.com',
    };

    const error = new Error('Failed to fetch sports');
    mockUserService.getUserProfile.mockResolvedValue(mockProfile);
    mockUserService.getSchools.mockResolvedValue([]);
    mockUserService.getSports.mockRejectedValue(error);

    const { result } = renderHook(() => useUserProfile(userId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch sports');
    expect(result.current.profile).toBeNull();
    expect(result.current.sports).toEqual([]);
  });

  it('should set error when userId is empty', async () => {
    const { result } = renderHook(() => useUserProfile(''), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBe('User ID is required');
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockUserService.getUserProfile).not.toHaveBeenCalled();
  });

  it('should refresh profile when refreshProfile is called', async () => {
    const mockProfile: UserProfile = {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      school: 'High School',
      grade: '12',
      sleepHours: 8,
      studyHours: 4,
      activeHours: 2,
      stressLevel: 5,
      sport: 'Football',
      wearable: 'Apple Watch',
      screenTime: 3,
      athleticGoal: 'Win championship',
      academicGoal: 'Get into college',
      coachName: 'Coach Smith',
      coachEmail: 'coach@school.com',
    };

    mockUserService.getUserProfile.mockResolvedValue(mockProfile);
    mockUserService.getSchools.mockResolvedValue([]);
    mockUserService.getSports.mockResolvedValue([]);

    const { result } = renderHook(() => useUserProfile(userId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear mocks to verify refresh calls
    vi.clearAllMocks();

    await act(async () => {
      await result.current.refreshProfile();
    });

    expect(mockUserService.getUserProfile).toHaveBeenCalledWith(userId);
    expect(mockUserService.getSchools).toHaveBeenCalled();
    expect(mockUserService.getSports).toHaveBeenCalled();
  });

  it('should update profile when updateProfile is called', async () => {
    const mockProfile: UserProfile = {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      school: 'High School',
      grade: '12',
      sleepHours: 8,
      studyHours: 4,
      activeHours: 2,
      stressLevel: 5,
      sport: 'Football',
      wearable: 'Apple Watch',
      screenTime: 3,
      athleticGoal: 'Win championship',
      academicGoal: 'Get into college',
      coachName: 'Coach Smith',
      coachEmail: 'coach@school.com',
    };

    mockUserService.getUserProfile.mockResolvedValue(mockProfile);
    mockUserService.getSchools.mockResolvedValue([]);
    mockUserService.getSports.mockResolvedValue([]);
    mockUserService.updateUserProfile.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUserProfile(userId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const updateData = { firstName: 'Jane' };

    await act(async () => {
      await result.current.updateProfile(updateData);
    });

    expect(mockUserService.updateUserProfile).toHaveBeenCalledWith(
      userId,
      updateData
    );
  });

  it('should handle update profile error', async () => {
    const mockProfile: UserProfile = {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      school: 'High School',
      grade: '12',
      sleepHours: 8,
      studyHours: 4,
      activeHours: 2,
      stressLevel: 5,
      sport: 'Football',
      wearable: 'Apple Watch',
      screenTime: 3,
      athleticGoal: 'Win championship',
      academicGoal: 'Get into college',
      coachName: 'Coach Smith',
      coachEmail: 'coach@school.com',
    };

    mockUserService.getUserProfile.mockResolvedValue(mockProfile);
    mockUserService.getSchools.mockResolvedValue([]);
    mockUserService.getSports.mockResolvedValue([]);
    mockUserService.updateUserProfile.mockRejectedValue(
      new Error('Update failed')
    );

    const { result } = renderHook(() => useUserProfile(userId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const updateData = { firstName: 'Jane' };

    await expect(
      act(async () => {
        await result.current.updateProfile(updateData);
      })
    ).rejects.toThrow('Update failed');
  });

  it('should not fetch when userId is null', async () => {
    const { result } = renderHook(() => useUserProfile(null as any), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockUserService.getUserProfile).not.toHaveBeenCalled();
  });
});
