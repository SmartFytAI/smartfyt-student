import { describe, it, expect } from 'vitest';

import {
  getWidgetColors,
  getLoadingSpinnerColor,
  getButtonColors,
  getBadgeColors,
  getTextColors,
} from '../theme-utils';

describe('Theme Utils', () => {
  describe('getWidgetColors', () => {
    it('returns quest colors', () => {
      const colors = getWidgetColors('quest');
      expect(colors.primary).toContain('text-primary-600');
      expect(colors.border).toContain('border-primary-200');
      expect(colors.bg).toContain('bg-primary-50');
    });

    it('returns feedback colors', () => {
      const colors = getWidgetColors('feedback');
      expect(colors.primary).toContain('text-secondary-600');
      expect(colors.border).toContain('border-secondary-200');
      expect(colors.bg).toContain('bg-secondary-50');
    });

    it('returns team colors', () => {
      const colors = getWidgetColors('team');
      expect(colors.primary).toContain('text-primary-600');
      expect(colors.border).toContain('border-primary-200');
    });

    it('returns journal colors', () => {
      const colors = getWidgetColors('journal');
      expect(colors.primary).toContain('text-primary-600');
      expect(colors.border).toContain('border-primary-200');
    });
  });

  describe('getLoadingSpinnerColor', () => {
    it('returns primary spinner color', () => {
      const color = getLoadingSpinnerColor('primary');
      expect(color).toContain('border-primary-600');
    });

    it('returns secondary spinner color', () => {
      const color = getLoadingSpinnerColor('secondary');
      expect(color).toContain('border-secondary-600');
    });

    it('returns white spinner color', () => {
      const color = getLoadingSpinnerColor('white');
      expect(color).toBe('border-white');
    });

    it('returns primary color for unknown type', () => {
      const color = getLoadingSpinnerColor('unknown' as any);
      expect(color).toContain('border-primary-600');
    });
  });

  describe('getButtonColors', () => {
    it('returns primary button colors', () => {
      const colors = getButtonColors('primary');
      expect(colors).toContain('bg-primary-600');
      expect(colors).toContain('text-white');
    });

    it('returns secondary button colors', () => {
      const colors = getButtonColors('secondary');
      expect(colors).toContain('bg-secondary-600');
      expect(colors).toContain('text-white');
    });

    it('returns outline button colors', () => {
      const colors = getButtonColors('outline');
      expect(colors).toContain('border');
      expect(colors).toContain('text-primary-600');
    });

    it('returns ghost button colors', () => {
      const colors = getButtonColors('ghost');
      expect(colors).toContain('text-primary-600');
      expect(colors).toContain('hover:bg-primary-50');
    });
  });

  describe('getBadgeColors', () => {
    it('returns success badge colors', () => {
      const colors = getBadgeColors('success');
      expect(colors).toContain('bg-success-100');
      expect(colors).toContain('text-success-800');
    });

    it('returns warning badge colors', () => {
      const colors = getBadgeColors('warning');
      expect(colors).toContain('bg-warning-100');
      expect(colors).toContain('text-warning-800');
    });

    it('returns error badge colors', () => {
      const colors = getBadgeColors('error');
      expect(colors).toContain('bg-danger-100');
      expect(colors).toContain('text-danger-800');
    });

    it('returns general badge colors', () => {
      const colors = getBadgeColors('general');
      expect(colors).toContain('bg-secondary-100');
      expect(colors).toContain('text-secondary-800');
    });
  });

  describe('getTextColors', () => {
    it('returns primary text colors', () => {
      const colors = getTextColors('primary');
      expect(colors).toContain('text-neutral-900');
      expect(colors).toContain('dark:text-white');
    });

    it('returns secondary text colors', () => {
      const colors = getTextColors('secondary');
      expect(colors).toContain('text-neutral-600');
      expect(colors).toContain('dark:text-neutral-400');
    });

    it('returns muted text colors', () => {
      const colors = getTextColors('muted');
      expect(colors).toContain('text-neutral-500');
    });

    it('returns inverse text colors', () => {
      const colors = getTextColors('inverse');
      expect(colors).toContain('text-white');
      expect(colors).toContain('dark:text-neutral-900');
    });
  });
});
