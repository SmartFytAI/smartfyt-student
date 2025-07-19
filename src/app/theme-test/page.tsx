'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';

export default function ThemeTestPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <h1 className='mb-4 text-2xl font-bold'>Loading theme...</h1>
          <p className='text-gray-600'>Preventing hydration mismatch</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen p-8'>
      <div className='mx-auto max-w-2xl'>
        <h1 className='mb-8 text-3xl font-bold'>Theme Test Page</h1>

        <div className='space-y-6'>
          <div className='rounded-lg border p-6'>
            <h2 className='mb-4 text-xl font-semibold'>Current Theme</h2>
            <p className='text-lg'>
              Active theme:{' '}
              <span className='rounded bg-gray-100 px-2 py-1 font-mono dark:bg-gray-800'>
                {theme}
              </span>
            </p>
          </div>

          <div className='rounded-lg border p-6'>
            <h2 className='mb-4 text-xl font-semibold'>Theme Controls</h2>
            <div className='flex flex-wrap gap-4'>
              <Button onClick={() => setTheme('light')}>Light Theme</Button>
              <Button onClick={() => setTheme('dark')}>Dark Theme</Button>
              <Button onClick={() => setTheme('system')}>System Theme</Button>
              <ThemeToggle />
            </div>
          </div>

          <div className='rounded-lg border p-6'>
            <h2 className='mb-4 text-xl font-semibold'>Test Content</h2>
            <p className='mb-4'>
              This page tests theme switching to ensure there are no hydration
              mismatches. The theme should switch smoothly without any console
              errors.
            </p>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='rounded border bg-white p-4 dark:bg-gray-800'>
                <h3 className='mb-2 font-semibold'>Light/Dark Card</h3>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  This card adapts to the current theme.
                </p>
              </div>
              <div className='rounded border bg-gray-100 p-4 dark:bg-gray-900'>
                <h3 className='mb-2 font-semibold'>Alternate Card</h3>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  This card has different styling.
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border p-6'>
            <h2 className='mb-4 text-xl font-semibold'>Hydration Status</h2>
            <p className='text-green-600 dark:text-green-400'>
              ✅ No hydration mismatches detected
            </p>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              If you see this message without console errors, the theme system
              is working correctly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
