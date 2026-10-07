import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { api, ApiError } from '../lib/api-client.ts';
import { server } from './msw/server.ts';

describe('api client', () => {
  it('returns the JSON of a successful response', async () => {
    server.use(http.get('/api/things', () => HttpResponse.json({ id: 1 })));

    await expect(api.get('/things')).resolves.toEqual({ id: 1 });
  });

  it('sends the body as JSON', async () => {
    let received: { contentType: string | null; body: unknown } | undefined;
    server.use(
      http.post('/api/things', async ({ request }) => {
        received = {
          contentType: request.headers.get('Content-Type'),
          body: await request.json(),
        };
        return HttpResponse.json({ id: 1 }, { status: 201 });
      }),
    );

    await api.post('/things', { name: 'Dolmama' });

    expect(received).toEqual({
      contentType: 'application/json',
      body: { name: 'Dolmama' },
    });
  });

  it('throws an ApiError with the message, code and details from the backend', async () => {
    server.use(
      http.post('/api/reservations', () =>
        HttpResponse.json(
          {
            error: {
              message: 'This table was just booked',
              code: 'TABLE_TAKEN',
              details: { tableId: 't1' },
            },
          },
          { status: 409 },
        ),
      ),
    );

    const error = await api.post('/reservations').catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      message: 'This table was just booked',
      code: 'TABLE_TAKEN',
      details: { tableId: 't1' },
    });
  });

  it('uses the HTTP status text when the error response is not JSON', async () => {
    server.use(
      http.get(
        '/api/broken',
        () =>
          new HttpResponse('upstream failed', {
            status: 502,
            statusText: 'Bad Gateway',
          }),
      ),
    );

    await expect(api.get('/broken')).rejects.toMatchObject({
      status: 502,
      message: 'Bad Gateway',
    });
  });
});
