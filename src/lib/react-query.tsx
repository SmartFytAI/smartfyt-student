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

  // Check debug status on mount and when it changes
  useEffect(() => {
    const checkDebugStatus = () => {
      setShowDevtools(isDebugEnabled());
    };

    // Check initial status
    checkDebugStatus();

    // Listen for changes to debug status
    const interval = setInterval(checkDebugStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: (failureCount, error: unknown) => {
              // Don't retry on 401 (unauthorized) errors
              const err = error as { status?: number };
              if (err?.status === 401) return false;
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
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
      {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
