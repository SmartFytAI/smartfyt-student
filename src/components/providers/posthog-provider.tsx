'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

import PostHogPageView from '@/components/analytics/posthog-page-view';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize in production or when explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageleave: false, // Disabled for performance
        enable_heatmaps: false, // Disabled for performance
        autocapture: false, // Disabled for performance - we'll track manually
        disable_session_recording: true, // Disabled for performance
        loaded: (posthog) => {
          // Only track in production
          if (process.env.NODE_ENV === 'production') {
            posthog.debug(false);
          }
        },
      });
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
} 