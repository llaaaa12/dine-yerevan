import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import express from 'express';
import request from 'supertest';
import { z } from 'zod';

import { errorHandler } from '../src/middlewares/error-handler.js';
import { validate } from '../src/middlewares/validate.js';
import { HttpError } from '../src/utils/http-error.js';

// A tiny app with only the middleware under test
function buildApp(addRoutes: (app: express.Express) => void) {
  const app = express();
  app.use(express.json());
  addRoutes(app);
  app.use(errorHandler);
  return app;
}

describe('validate()', () => {
  const app = buildApp((app) => {
    app.get(
      '/items',
      validate({ query: z.object({ page: z.coerce.number().int().min(1) }) }),
      (req, res) => {
        res.json(res.locals.query);
      },
    );
    app.post(
      '/items',
      validate({ body: z.object({ name: z.string().trim().min(1) }) }),
      (req, res) => {
        res.status(201).json(res.locals.body);
      },
    );
  });

  it('passes the parsed values to the handler in res.locals', async () => {
    const res = await request(app).get('/items?page=2');

    assert.equal(res.status, 200);
    // A number, not the string "2" from the URL
    assert.deepEqual(res.body, { page: 2 });
  });

  it('returns 400 with the failing fields', async () => {
    const res = await request(app).get('/items?page=0');

    assert.equal(res.status, 400);
    assert.equal(res.body.error.message, 'Validation failed');
    assert.equal(res.body.error.details.location, 'query');
    assert.ok(res.body.error.details.fieldErrors.page);
  });

  it('trims body strings and rejects a missing body', async () => {
    const created = await request(app)
      .post('/items')
      .send({ name: ' Dolmama ' });
    assert.equal(created.status, 201);
    assert.deepEqual(created.body, { name: 'Dolmama' });

    const missing = await request(app).post('/items');
    assert.equal(missing.status, 400);
    assert.equal(missing.body.error.details.location, 'body');
  });
});

describe('error handler', () => {
  const app = buildApp((app) => {
    app.get('/taken', () => {
      throw new HttpError(409, 'This table was just booked', {
        code: 'TABLE_TAKEN',
      });
    });
    app.get('/crash', () => {
      // Like a raw PostgreSQL error, which carries its own internal code
      throw Object.assign(new Error('duplicate key value'), { code: '23505' });
    });
  });

  it('sends the code of an HttpError', async () => {
    const res = await request(app).get('/taken');

    assert.equal(res.status, 409);
    assert.deepEqual(res.body.error, {
      message: 'This table was just booked',
      code: 'TABLE_TAKEN',
    });
  });

  it('hides the message and code of unexpected errors', async (t) => {
    // The handler logs 500s; keep the test output clean
    t.mock.method(console, 'error', () => {});

    const res = await request(app).get('/crash');

    assert.equal(res.status, 500);
    assert.equal(res.body.error.message, 'Internal Server Error');
    assert.equal(res.body.error.code, undefined);
  });
});
