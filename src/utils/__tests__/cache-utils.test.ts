import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('Cache Utils', () => {
  const mockCaches = {
    keys: vi.fn(),
    delete: vi.fn(),
  };

  const mockServiceWorker = {
    getRegistrations: vi.fn(),
  };

  const mockLocation = {
    reload: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    // Mock browser APIs
    Object.defineProperty(global, 'caches', {
      value: mockCaches,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'navigator', {
      value: {
        serviceWorker: mockServiceWorker,
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });

    // Ensure window object exists and has the required properties
    if (typeof global.window === 'undefined') {
      Object.defineProperty(global, 'window', {
        value: global,
        writable: true,
        configurable: true,
      });
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('clearCacheByName', () => {
    it('should clear specific cache successfully', async () => {
      mockCaches.delete.mockResolvedValue(true);

      const { clearCacheByName } = await import('@/utils/cache-utils');
      await clearCacheByName('test-cache');

      expect(mockCaches.delete).toHaveBeenCalledWith('test-cache');
    });

    it('should handle errors when clearing specific cache', async () => {
      const error = new Error('Cache delete error');
      mockCaches.delete.mockRejectedValue(error);

      const { clearCacheByName } = await import('@/utils/cache-utils');
      await clearCacheByName('test-cache');

      const { logger } = await import('@/lib/logger');
      expect(logger.error).toHaveBeenCalledWith(
        "❌ Failed to clear cache 'test-cache':",
        error
      );
    });

    it('should handle when cache does not exist', async () => {
      mockCaches.delete.mockResolvedValue(false);

      const { clearCacheByName } = await import('@/utils/cache-utils');
      await clearCacheByName('test-cache');

      expect(mockCaches.delete).toHaveBeenCalledWith('test-cache');
    });
  });

  describe('clearAllCaches', () => {
    it('should clear all caches successfully', async () => {
      const cacheNames = ['cache1', 'cache2', 'cache3'];
      mockCaches.keys.mockResolvedValue(cacheNames);
      mockCaches.delete.mockResolvedValue(true);

      const { clearAllCaches } = await import('@/utils/cache-utils');
      await clearAllCaches();

      expect(mockCaches.keys).toHaveBeenCalled();
      expect(mockCaches.delete).toHaveBeenCalledTimes(3);
      expect(mockCaches.delete).toHaveBeenCalledWith('cache1');
      expect(mockCaches.delete).toHaveBeenCalledWith('cache2');
      expect(mockCaches.delete).toHaveBeenCalledWith('cache3');
    });

    it('should handle errors when clearing all caches', async () => {
      const error = new Error('Cache clear error');
      mockCaches.keys.mockRejectedValue(error);

      const { clearAllCaches } = await import('@/utils/cache-utils');
      await clearAllCaches();

      const { logger } = await import('@/lib/logger');
      expect(logger.error).toHaveBeenCalledWith(
        '❌ Failed to clear caches:',
        error
      );
    });
  });

  describe('forceReloadAndClearCaches', () => {
    it('should clear caches and reload page', async () => {
      const cacheNames = ['cache1', 'cache2'];
      mockCaches.keys.mockResolvedValue(cacheNames);
      mockCaches.delete.mockResolvedValue(true);

      const { forceReloadAndClearCaches } = await import('@/utils/cache-utils');
      await forceReloadAndClearCaches();

      expect(mockCaches.keys).toHaveBeenCalled();
      expect(mockCaches.delete).toHaveBeenCalled();
      expect(mockLocation.reload).toHaveBeenCalled();
    });

    it('should handle errors during force reload', async () => {
      const error = new Error('Reload error');
      mockCaches.keys.mockRejectedValue(error);

      const { forceReloadAndClearCaches } = await import('@/utils/cache-utils');
      await forceReloadAndClearCaches();

      const { logger } = await import('@/lib/logger');
      expect(logger.error).toHaveBeenCalledWith(
        '❌ Failed to clear caches:',
        error
      );
    });
  });

  describe('handleLogoutCacheClear', () => {
    it('should clear caches and service workers on logout', async () => {
      const cacheNames = [
        'css-cache',
        'api-cache',
        'auth-cache',
        'other-cache',
      ];
      mockCaches.keys.mockResolvedValue(cacheNames);
      mockCaches.delete.mockResolvedValue(true);

      const { handleLogoutCacheClear } = await import('@/utils/cache-utils');
      await handleLogoutCacheClear();

      expect(mockCaches.keys).toHaveBeenCalled();
      expect(mockCaches.delete).toHaveBeenCalled();
    });

    it('should handle errors during logout cache clear', async () => {
      const error = new Error('Cache clear error');
      mockCaches.keys.mockRejectedValue(error);

      const { handleLogoutCacheClear } = await import('@/utils/cache-utils');
      await handleLogoutCacheClear();

      const { logger } = await import('@/lib/logger');
      expect(logger.error).toHaveBeenCalledWith(
        '❌ Failed to clear caches on logout:',
        error
      );
    });
  });

  describe('clearCSSCaches', () => {
    it('should clear CSS caches', async () => {
      const cacheNames = [
        'css-cache',
        'static-cache',
        'smartfyt-student-cache',
        'other-cache',
      ];
      mockCaches.keys.mockResolvedValue(cacheNames);
      mockCaches.delete.mockResolvedValue(true);

      const { clearCSSCaches } = await import('@/utils/cache-utils');
      await clearCSSCaches();

      expect(mockCaches.keys).toHaveBeenCalled();
      expect(mockCaches.delete).toHaveBeenCalledTimes(3); // css-cache, static-cache, smartfyt-student-cache
    });

    it('should handle errors when clearing CSS caches', async () => {
      const error = new Error('CSS cache error');
      mockCaches.keys.mockRejectedValue(error);

      const { clearCSSCaches } = await import('@/utils/cache-utils');
      await clearCSSCaches();

      const { logger } = await import('@/lib/logger');
      expect(logger.error).toHaveBeenCalledWith(
        '❌ Failed to clear CSS caches:',
        error
      );
    });
  });
});
