import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from './routes.tsx';

function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

describe('routes', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ status: 'ok', uptime: 1, database: 'up' }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the home page with the API status', async () => {
    renderRoute('/');

    expect(
      screen.getByRole('heading', { name: 'Dine Yerevan' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('API status: ok, database up'),
    ).toBeInTheDocument();
  });

  it('renders the not-found page for unknown URLs', () => {
    renderRoute('/no-such-page');

    expect(
      screen.getByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument();
  });
});
