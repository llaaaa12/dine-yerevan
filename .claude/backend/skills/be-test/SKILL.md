---
name: be-test
description: "Write or extend Dine Yerevan backend tests (node:test + Supertest against the dine_yerevan_test database): API tests with factories and logged-in agents, unit tests for pure *.rules.ts functions, and the Step 7 race and constraint-proof tests. Use when adding backend behavior, fixing a backend bug, or when the user asks for backend tests."
argument-hint: "[feature, endpoint or file to test]"
---

# Backend tests

Target: $ARGUMENTS. Follow `.claude/backend/rules/testing.md`.

1. **List the cases first**, and show them to the user.
   - For each endpoint: the happy path, plus 400, 401, 403, 404 (not yours) and 409.
   - For rules: the edge cases, such as Yerevan midnight, overnight hours, back-to-back bookings, the cutoff minute, and min/max values.
2. **File:** `backend/tests/<feature>.test.ts`. Skeleton:
   ```ts
   import assert from 'node:assert/strict';
   import { after, before, beforeEach, describe, it } from 'node:test';

   import request from 'supertest';

   import { app } from '../src/app.js';
   import { closeTestDb, resetDb, setupTestDb } from './helpers/db.js';

   describe('POST /api/…', () => {
     before(setupTestDb);
     beforeEach(resetDb);
     after(closeTestDb);

     it('creates … and returns 201', async () => {
       const res = await request(app).post('/api/…').send({});
       assert.equal(res.status, 201);
     });
   });
   ```
3. **Data:**
   - Build test data with `tests/helpers/factories.ts`. Add a factory when a new entity appears.
   - For logged-in requests, use a helper that logs in and returns `request.agent(app)` with the cookies.
4. **Check the database too:** confirm the row was created or changed, not only the response.
5. **Pure rules** (`src/services/*.rules.ts`) get plain unit tests: no database, and `now` passed in.
6. **Step 7 patterns:**
   - **Race:** 10 customers send 10 `POST /api/reservations` with `Promise.all`, for the same table and time. Expect exactly one `201`, nine `409 TABLE_TAKEN`, and one active row.
   - **Constraint proof**, with two `QueryRunner`s:
     1. A inserts without committing.
     2. B's overlapping insert is still waiting after ~200 ms.
     3. A commits.
     4. B fails with `23P01` (`reservations_no_overlap`).
7. **Run** `npm test` in `backend/` (Docker must be running) and show the result.
