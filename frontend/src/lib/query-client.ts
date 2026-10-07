import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './api-client.ts';

// Retry once after a network or server (5xx) error. A client error (4xx) would fail again.
export function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiError && error.status < 500) {
    return false;
  }
  return failureCount < 1;
}

// One cache for all server data. Components read it with useQuery and change it with useMutation.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data counts as fresh for 30 s, so going back to a page doesn't refetch it right away
      staleTime: 30_000,
      retry: shouldRetry,
    },
  },
});
