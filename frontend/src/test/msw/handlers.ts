import { http, HttpResponse } from 'msw';

// Default fake API responses for component tests.
// Override one in a single test with: server.use(http.get('/api/…', () => …))
export const handlers = [
  http.get('/api/health', () =>
    HttpResponse.json({ status: 'ok', uptime: 1, database: 'up' }),
  ),
];
