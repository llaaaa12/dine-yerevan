import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from './test/msw/server.ts';
import { renderRoute } from './test/render.tsx';

describe('routes', () => {
  it('renders the home page with the API status', async () => {
    renderRoute('/');

    expect(
      screen.getByRole('heading', { name: 'Dine Yerevan' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('API status: ok, database up'),
    ).toBeInTheDocument();
  });

  it('shows when the backend is unreachable', async () => {
    server.use(http.get('/api/health', () => HttpResponse.error()));

    renderRoute('/');

    expect(
      await screen.findByText(
        'API status: unreachable (is the backend running?)',
      ),
    ).toBeInTheDocument();
  });

  it('renders the not-found page for unknown URLs', () => {
    renderRoute('/no-such-page');

    expect(
      screen.getByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to the home page' }),
    ).toHaveAttribute('href', '/');
  });
});
