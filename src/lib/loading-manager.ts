import { create } from 'zustand';

import { logger } from './logger';

export interface LoadingState {
  id: string;
  isLoading: boolean;
  progress?: number;
  message?: string;
  startTime: number;
}

export interface LoadingManagerState {
  loadingStates: Map<string, LoadingState>;
  globalLoading: boolean;
  actions: {
    startLoading: (id: string, message?: string) => void;
    stopLoading: (id: string) => void;
    updateProgress: (id: string, progress: number) => void;
    updateMessage: (id: string, message: string) => void;
    setGlobalLoading: (loading: boolean) => void;
    clearAllLoading: () => void;
    getLoadingState: (id: string) => LoadingState | undefined;
    isAnyLoading: () => boolean;
  };
}

/**
 * Centralized loading state management for the SmartFyt Student app
 */
export const useLoadingManager = create<LoadingManagerState>((set, get) => ({
  loadingStates: new Map(),
  globalLoading: false,

  actions: {
    /**
     * Start a loading state
     */
    startLoading: (id: string, message?: string) => {
      logger.debug('LoadingManager: Starting loading state', { id, message });

      set(state => {
        const newLoadingStates = new Map(state.loadingStates);
        newLoadingStates.set(id, {
          id,
          isLoading: true,
          message,
          startTime: Date.now(),
        });

        return {
          loadingStates: newLoadingStates,
          globalLoading: true,
        };
      });
    },

    /**
     * Stop a loading state
     */
    stopLoading: (id: string) => {
      logger.debug('LoadingManager: Stopping loading state', { id });

      set(state => {
        const newLoadingStates = new Map(state.loadingStates);
        newLoadingStates.delete(id);

        const isAnyLoading = newLoadingStates.size > 0;

        return {
          loadingStates: newLoadingStates,
          globalLoading: isAnyLoading,
        };
      });
    },

    /**
     * Update progress for a loading state
     */
    updateProgress: (id: string, progress: number) => {
      set(state => {
        const loadingState = state.loadingStates.get(id);
        if (!loadingState) return state;

        const newLoadingStates = new Map(state.loadingStates);
        newLoadingStates.set(id, {
          ...loadingState,
          progress: Math.min(100, Math.max(0, progress)),
        });

        return { loadingStates: newLoadingStates };
      });
    },

    /**
     * Update message for a loading state
     */
    updateMessage: (id: string, message: string) => {
      set(state => {
        const loadingState = state.loadingStates.get(id);
        if (!loadingState) return state;

        const newLoadingStates = new Map(state.loadingStates);
        newLoadingStates.set(id, {
          ...loadingState,
          message,
        });

        return { loadingStates: newLoadingStates };
      });
    },

    /**
     * Set global loading state
     */
    setGlobalLoading: (loading: boolean) => {
      logger.debug('LoadingManager: Setting global loading', { loading });
      set({ globalLoading: loading });
    },

    /**
     * Clear all loading states
     */
    clearAllLoading: () => {
      logger.debug('LoadingManager: Clearing all loading states');
      set({
        loadingStates: new Map(),
        globalLoading: false,
      });
    },

    /**
     * Get loading state by ID
     */
    getLoadingState: (id: string) => {
      return get().loadingStates.get(id);
    },

    /**
     * Check if any loading state is active
     */
    isAnyLoading: () => {
      return get().loadingStates.size > 0;
    },
  },
}));

/**
 * Hook to use loading manager
 */
export function useLoading() {
  const { actions, loadingStates, globalLoading } = useLoadingManager();

  return {
    // Actions
    startLoading: actions.startLoading,
    stopLoading: actions.stopLoading,
    updateProgress: actions.updateProgress,
    updateMessage: actions.updateMessage,
    setGlobalLoading: actions.setGlobalLoading,
    clearAllLoading: actions.clearAllLoading,
    getLoadingState: actions.getLoadingState,
    isAnyLoading: actions.isAnyLoading,

    // State
    loadingStates: Array.from(loadingStates.values()),
    globalLoading,
    loadingCount: loadingStates.size,
  };
}

/**
 * Hook for component-specific loading state
 */
export function useComponentLoading(componentId: string) {
  const { actions } = useLoadingManager();

  const loadingState = actions.getLoadingState(componentId);

  return {
    isLoading: loadingState?.isLoading ?? false,
    progress: loadingState?.progress,
    message: loadingState?.message,
    startLoading: (message?: string) =>
      actions.startLoading(componentId, message),
    stopLoading: () => actions.stopLoading(componentId),
    updateProgress: (progress: number) =>
      actions.updateProgress(componentId, progress),
    updateMessage: (message: string) =>
      actions.updateMessage(componentId, message),
  };
}

/**
 * Predefined loading IDs for common operations
 */
export const LoadingIds = {
  // User operations
  USER_PROFILE_LOAD: 'user-profile-load',
  USER_PROFILE_UPDATE: 'user-profile-update',

  // Journal operations
  JOURNAL_CREATE: 'journal-create',
  JOURNAL_LOAD: 'journal-load',
  JOURNAL_UPDATE: 'journal-update',

  // Quest operations
  QUEST_LOAD: 'quest-load',
  QUEST_COMPLETE: 'quest-complete',
  QUEST_ASSIGN: 'quest-assign',

  // Health operations
  HEALTH_DATA_LOAD: 'health-data-load',
  HEALTH_SYNC: 'health-sync',

  // Team operations
  TEAM_LOAD: 'team-load',
  TEAM_LEADERBOARD_LOAD: 'team-leaderboard-load',

  // Dashboard operations
  DASHBOARD_LOAD: 'dashboard-load',
  DASHBOARD_REFRESH: 'dashboard-refresh',

  // Authentication
  AUTH_LOGIN: 'auth-login',
  AUTH_LOGOUT: 'auth-logout',
  AUTH_REFRESH: 'auth-refresh',

  // General
  DATA_SYNC: 'data-sync',
  APP_INIT: 'app-init',
} as const;
