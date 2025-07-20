import { useState, useEffect, useCallback } from 'react';

import { logger } from '@/lib/logger';
import { JournalService } from '@/lib/services/journal-service';
import { Journal } from '@/types';

interface JournalStatus {
  hasJournalToday: boolean;
  latestJournal: Journal | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useJournalStatus(userId: string): JournalStatus {
  const [hasJournalToday, setHasJournalToday] = useState(false);
  const [latestJournal, setLatestJournal] = useState<Journal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkJournalStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      logger.debug('📝 Checking journal status for user:', { userId });

      const [todayStatus, latest] = await Promise.all([
        JournalService.hasJournalToday(userId),
        JournalService.getLatestJournal(userId),
      ]);

      setHasJournalToday(todayStatus);
      setLatestJournal(latest);

      logger.debug('✅ Journal status checked:', {
        hasJournalToday: todayStatus,
        hasLatestJournal: !!latest,
        userId,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to check journal status';
      logger.error('❌ Error checking journal status:', { error: err, userId });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      checkJournalStatus();
    }
  }, [userId, checkJournalStatus]);

  return {
    hasJournalToday,
    latestJournal,
    isLoading,
    error,
    refresh: checkJournalStatus,
  };
}
