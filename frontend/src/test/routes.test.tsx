import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderRoute } from './render.tsx';

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
