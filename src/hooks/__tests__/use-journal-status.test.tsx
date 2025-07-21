import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the JournalService
vi.mock('@/lib/services/journal-service', () => ({
  JournalService: {
    hasJournalToday: vi.fn(),
    getLatestJournal: vi.fn(),
  },
}));

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

import { useJournalStatus } from '../use-journal-status';
import { JournalService } from '@/lib/services/journal-service';

describe('useJournalStatus', () => {
  const userId = 'user-123';
  const mockJournalService = vi.mocked(JournalService);

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
    mockJournalService.hasJournalToday.mockResolvedValue(false);
    mockJournalService.getLatestJournal.mockResolvedValue(null);

    const { result } = renderHook(() => useJournalStatus(userId), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasJournalToday).toBe(false);
    expect(result.current.latestJournal).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should load journal status successfully', async () => {
    const mockJournal = {
      id: 'journal-1',
      title: 'Test Journal',
      wentWell: 'Everything went well today',
      notWell: 'Nothing went wrong',
      goals: 'My goals for tomorrow',
      authorID: 'user-123',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      response: 'Coach response',
      sleepHours: 8,
      activeHours: 2,
      stress: 5,
      screenTime: 3,
      studyHours: 4,
    };

    mockJournalService.hasJournalToday.mockResolvedValue(true);
    mockJournalService.getLatestJournal.mockResolvedValue(mockJournal);

    const { result } = renderHook(() => useJournalStatus(userId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasJournalToday).toBe(true);
    expect(result.current.latestJournal).toEqual(mockJournal);
    expect(result.current.error).toBe(null);
  });

  it('should handle case when user has no journal today', async () => {
    mockJournalService.hasJournalToday.mockResolvedValue(false);
    mockJournalService.getLatestJournal.mockResolvedValue(null);

    const { result } = renderHook(() => useJournalStatus(userId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasJournalToday).toBe(false);
    expect(result.current.latestJournal).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should handle API errors gracefully', async () => {
    const error = new Error('Failed to fetch journal status');
    mockJournalService.hasJournalToday.mockRejectedValue(error);
    mockJournalService.getLatestJournal.mockResolvedValue(null);

    const { result } = renderHook(() => useJournalStatus(userId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch journal status');
    expect(result.current.hasJournalToday).toBe(false);
    expect(result.current.latestJournal).toBe(null);
  });

  it('should handle non-Error objects', async () => {
    const error = 'String error';
    mockJournalService.hasJournalToday.mockRejectedValue(error);
    mockJournalService.getLatestJournal.mockResolvedValue(null);

    const { result } = renderHook(() => useJournalStatus(userId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to check journal status');
  });

  it('should refresh journal status when refresh is called', async () => {
    const mockJournal = {
      id: 'journal-1',
      title: 'Test Journal',
      wentWell: 'Everything went well today',
      notWell: 'Nothing went wrong',
      goals: 'My goals for tomorrow',
      authorID: 'user-123',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      response: 'Coach response',
      sleepHours: 8,
      activeHours: 2,
      stress: 5,
      screenTime: 3,
      studyHours: 4,
    };

    mockJournalService.hasJournalToday.mockResolvedValue(true);
    mockJournalService.getLatestJournal.mockResolvedValue(mockJournal);

    const { result } = renderHook(() => useJournalStatus(userId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasJournalToday).toBe(true);
    expect(result.current.latestJournal).toEqual(mockJournal);

    // Test refresh functionality
    const updatedJournal = { ...mockJournal, title: 'Updated Journal' };
    mockJournalService.hasJournalToday.mockResolvedValue(true);
    mockJournalService.getLatestJournal.mockResolvedValue(updatedJournal);

    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.latestJournal).toEqual(updatedJournal);
    });
  });

  it('should handle empty userId', async () => {
    mockJournalService.hasJournalToday.mockResolvedValue(false);
    mockJournalService.getLatestJournal.mockResolvedValue(null);

    const { result } = renderHook(() => useJournalStatus(''), {
      wrapper: createWrapper(),
    });

    // For empty userId, the hook should not make API calls and should keep isLoading as true
    // since no API call is made to set it to false
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasJournalToday).toBe(false);
    expect(result.current.latestJournal).toBe(null);
    expect(result.current.error).toBe(null);

    // Verify no API calls were made
    expect(mockJournalService.hasJournalToday).not.toHaveBeenCalled();
    expect(mockJournalService.getLatestJournal).not.toHaveBeenCalled();
  });

  it('should handle multiple rapid calls gracefully', async () => {
    mockJournalService.hasJournalToday.mockResolvedValue(true);
    mockJournalService.getLatestJournal.mockResolvedValue(null);

    const { result } = renderHook(() => useJournalStatus(userId), {
      wrapper: createWrapper(),
    });

    // Make multiple rapid calls
    await result.current.refresh();
    await result.current.refresh();
    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Expect 4 total calls: 1 initial + 3 refresh calls
    expect(mockJournalService.hasJournalToday).toHaveBeenCalledTimes(4);
    expect(mockJournalService.getLatestJournal).toHaveBeenCalledTimes(4);
  });
});
