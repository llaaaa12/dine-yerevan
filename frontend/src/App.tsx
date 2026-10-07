import { QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { queryClient } from './lib/query-client.ts';
import { routes } from './routes.tsx';

const router = createBrowserRouter(routes);

// App-wide providers wrap the router here: server data (TanStack Query) now, auth in Step 2.
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
