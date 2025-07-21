import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock React Query to prevent hooks from executing
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Import after mocks are set up
import { CoachFeedbackService } from '../coach-feedback-service';

describe('CoachFeedbackService', () => {
  const userId = 'user-123';
  const feedbackId = 'feedback-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCoachFeedback', () => {
    it('returns mock coach feedback data', async () => {
      const result = await CoachFeedbackService.getCoachFeedback(userId);

      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            coachName: 'SmartFyt Coach',
            message: expect.any(String),
            date: '2024-01-15',
            type: 'positive',
            isRead: false,
          }),
          expect.objectContaining({
            id: '2',
            coachName: 'SmartFyt Coach',
            message: expect.any(String),
            date: '2024-01-14',
            type: 'positive',
            isRead: true,
          }),
          expect.objectContaining({
            id: '3',
            coachName: 'Coach Johnson',
            message: expect.any(String),
            date: '2024-01-13',
            type: 'improvement',
            isRead: true,
          }),
        ]),
        error: null,
        isLoading: false,
      });
    });

    it('returns correct data structure', async () => {
      const result = await CoachFeedbackService.getCoachFeedback(userId);

      expect(result.data).toHaveLength(3);
      expect(result.data?.[0]).toHaveProperty('id');
      expect(result.data?.[0]).toHaveProperty('coachName');
      expect(result.data?.[0]).toHaveProperty('message');
      expect(result.data?.[0]).toHaveProperty('date');
      expect(result.data?.[0]).toHaveProperty('type');
      expect(result.data?.[0]).toHaveProperty('isRead');
    });
  });

  describe('markAsRead', () => {
    it('marks feedback as read successfully', async () => {
      const result = await CoachFeedbackService.markAsRead(userId, feedbackId);

      expect(result).toEqual({ success: true });
    });
  });
});
