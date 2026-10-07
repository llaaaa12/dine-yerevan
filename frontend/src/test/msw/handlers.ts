import { http, HttpResponse } from 'msw';

// Default fake API answers, shared by the tests and mock mode (npm run dev:mock).
// Keep them realistic: they are the API contract until the real endpoint exists.
// Override one in a single test with: server.use(http.get('/api/…', () => …))
export const handlers = [
  http.get('/api/health', () =>
    HttpResponse.json({ status: 'ok', uptime: 1, database: 'up' }),
  ),
];
