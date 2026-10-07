import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import request from 'supertest';

import { app } from '../src/app.js';

describe('GET /api/health', () => {
  it('responds with status ok', async () => {
    const res = await request(app).get('/api/health');

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });
});

describe('error handling', () => {
  it('returns a 404 JSON error for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');

    assert.equal(res.status, 404);
    assert.match(res.body.error.message, /not found/i);
  });

  it('returns a 400 JSON error for malformed JSON bodies', async () => {
    const res = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{"broken": ');

    assert.equal(res.status, 400);
    assert.ok(res.body.error.message);
  });
});
