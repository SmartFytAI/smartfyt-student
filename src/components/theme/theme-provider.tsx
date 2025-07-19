'use client';

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes';
import * as React from 'react';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      enableSystem={true}
      disableTransitionOnChange={true}
      attribute='class'
      defaultTheme='system'
      storageKey='smartfyt-theme'
    >
      {children}
    </NextThemesProvider>
  );
}
