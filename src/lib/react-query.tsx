'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';

import { isDebugEnabled } from '@/lib/logger';

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showDevtools, setShowDevtools] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check debug status on mount and when it changes (client-side only)
  useEffect(() => {
    if (!isClient) return;

    const checkDebugStatus = () => {
      try {
        setShowDevtools(isDebugEnabled());
      } catch (_error) {
        // Fallback if debug check fails
        setShowDevtools(false);
      }
    };

    // Check initial status
    checkDebugStatus();

    // Listen for changes to debug status
    const interval = setInterval(checkDebugStatus, 1000);

    return () => clearInterval(interval);
  }, [isClient]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Extended stale time for better caching
            staleTime: 5 * 60 * 1000, // 5 minutes (increased from 1 minute)
            // Cache data for longer to show immediately on navigation
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            // Refetch in background when window regains focus
            refetchOnWindowFocus: true,
            // Refetch when reconnecting to network
            refetchOnReconnect: true,
            // Retry configuration
            retry: (failureCount, error: unknown) => {
              // Don't retry on 401 (unauthorized) errors
              const err = error as { status?: number };
              if (err?.status === 401) return false;
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
            // Show cached data immediately while refetching
            refetchOnMount: true,
            // Background refetch interval (disabled by default, can be overridden)
            refetchInterval: false,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevtools && isClient && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
