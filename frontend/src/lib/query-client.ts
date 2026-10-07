import { QueryClient } from '@tanstack/react-query';

// One cache for all server data. Components read it with useQuery and change it with useMutation.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data counts as fresh for 30 s, so going back to a page doesn't refetch it right away
      staleTime: 30_000,
      retry: 1,
    },
  },
});
