import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { routes } from '../routes.tsx';

// Same providers as App.tsx, with a fresh cache per test and no retries,
// so error states show immediately.
export function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

// Renders the whole app at `path`, using an in-memory router
export function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });

  return renderWithProviders(<RouterProvider router={router} />);
}
