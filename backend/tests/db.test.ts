import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import request from 'supertest';

import { app } from '../src/app.js';
import {
  assertTestDatabaseName,
  closeTestDb,
  setupTestDb,
} from './helpers/db.js';

describe('test database', () => {
  before(setupTestDb);
  after(closeTestDb);

  it('is connected, so the health check reports the database as up', async () => {
    const res = await request(app).get('/api/health');

    assert.equal(res.status, 200);
    assert.equal(res.body.database, 'up');
  });
});

describe('assertTestDatabaseName()', () => {
  it('refuses any database whose name does not end in _test', () => {
    assert.throws(() => assertTestDatabaseName('dine_yerevan'), /Refusing/);
    assert.doesNotThrow(() => assertTestDatabaseName('dine_yerevan_test'));
  });
});
