import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiStatus } from '../features/health/ApiStatus.tsx';
import { server } from './msw/server.ts';
import { renderWithProviders } from './render.tsx';

describe('ApiStatus', () => {
  it('shows that the API and the database are up, as a live status', async () => {
    renderWithProviders(<ApiStatus />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'API status: checking…',
    );
    expect(
      await screen.findByText('API status: ok, database up'),
    ).toHaveAttribute('role', 'status');
  });

  it('shows when the API runs but the database is down', async () => {
    server.use(
      http.get('/api/health', () =>
        HttpResponse.json({ status: 'ok', uptime: 1, database: 'down' }),
      ),
    );

    renderWithProviders(<ApiStatus />);

    expect(
      await screen.findByText('API status: ok, database down'),
    ).toBeInTheDocument();
  });

  it('shows when the backend is unreachable', async () => {
    server.use(http.get('/api/health', () => HttpResponse.error()));

    renderWithProviders(<ApiStatus />);

    expect(
      await screen.findByText(
        'API status: unreachable (is the backend running?)',
      ),
    ).toBeInTheDocument();
  });
});
