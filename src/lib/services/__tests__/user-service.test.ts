import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock React Query to prevent hooks from executing
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Import after mocks are set up
import { userService } from '../user-service';
import { UserProfile } from '@/lib/services/user-service';

describe('UserService', () => {
  const userId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getUserProfile', () => {
    it('fetches user profile successfully', async () => {
      const mockProfile: UserProfile = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        profileImage: 'profile.jpg',
        age: '18',
        phone: '123-456-7890',
        school: 'High School',
        grade: '12',
        sleepHours: 8,
        studyHours: 4,
        activeHours: 2,
        stressLevel: 5,
        sport: 'football',
        wearable: 'Apple Watch',
        screenTime: 3,
        athleticGoal: 'Win championship',
        academicGoal: 'Get into college',
        coachName: 'Coach Smith',
        coachEmail: 'coach@school.com',
      };

      // Mock fetch responses for the three API calls made by getUserProfile
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 'user-123',
            given_name: 'John',
            family_name: 'Doe',
            email: 'john@example.com',
            picture: 'profile.jpg',
            phone_number: '123-456-7890',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            {
              id: 'form-1',
              name: 'John Doe',
              age: '18',
              email: 'john@example.com',
              phone: '123-456-7890',
              grade: '12',
              sport: { id: 'football', name: 'Football' },
              team: {
                id: 'team-1',
                name: 'Varsity',
                sportID: 'football',
                schoolID: 'High School',
              },
              athleticGoals: 'Win championship',
              academicGoals: 'Get into college',
              sleepHours: 8,
              studyHours: 4,
              activeHours: 2,
              stress: 5,
              screenTime: 3,
              wearable: 'Apple Watch',
              coachName: 'Coach Smith',
              coachEmail: 'coach@school.com',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
          ],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            athletic: 'Win championship',
            academic: 'Get into college',
          }),
        });

      const result = await userService.getUserProfile(userId);

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockProfile);
    });

    it('handles API errors gracefully', async () => {
      // Mock fetch to throw an error
      mockFetch.mockRejectedValue(new Error('Failed to fetch user data'));

      const result = await userService.getUserProfile(userId);

      // When all requests fail, we get a profile with only the id
      expect(result).toEqual({
        id: 'user-123',
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        profileImage: undefined,
        phone: undefined,
      });
    });
  });

  describe('getSchools', () => {
    it('fetches schools successfully', async () => {
      const mockSchools = [
        { id: 'school-1', name: 'High School' },
        { id: 'school-2', name: 'Middle School' },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockSchools,
      });

      const result = await userService.getSchools();

      expect(mockFetch).toHaveBeenCalled();
      expect(result).toEqual(mockSchools);
    });
  });

  describe('getSports', () => {
    it('fetches sports successfully', async () => {
      const mockSports = [
        { id: 'sport-1', name: 'Football' },
        { id: 'sport-2', name: 'Basketball' },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockSports,
      });

      const result = await userService.getSports();

      expect(mockFetch).toHaveBeenCalled();
      expect(result).toEqual(mockSports);
    });
  });

  describe('updateUserProfile', () => {
    it('updates user profile successfully', async () => {
      const updateData = {
        sleepHours: 9,
        studyHours: 5,
        activeHours: 3,
        stressLevel: 4,
        screenTime: 2,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      await userService.updateUserProfile(userId, updateData);

      expect(mockFetch).toHaveBeenCalled();
    });

    it('handles update errors gracefully', async () => {
      const updateData = {
        sleepHours: 9,
        studyHours: 5,
        activeHours: 3,
        stressLevel: 4,
        screenTime: 2,
      };

      mockFetch.mockRejectedValue(new Error('fetch failed'));

      await expect(
        userService.updateUserProfile(userId, updateData)
      ).rejects.toThrow('fetch failed');
    });
  });
});
