# Backend rule: testing

Applies to every backend task that changes behavior.

## Setup
- **Tools:** `node:test` + `node:assert/strict` + Supertest.
- **Files:** `backend/tests/<feature>.test.ts`. Step 7 adds `reservations.concurrency.test.ts` and `reservations.constraint.test.ts`.
- **Running:** `npm test` runs the files one at a time against `dine_yerevan_test`, and needs Docker (`docker compose up -d`). If the test database is missing, run `npm run db:test:create`.
- **Tests that use the database** start with:
  `before(setupTestDb)` · `beforeEach(resetDb)` · `after(closeTestDb)`, all from `tests/helpers/db.ts`.
  `resetDb()` refuses any database whose name doesn't end in `_test`. Never weaken that.
- **Shared builders** go in `tests/helpers/factories.ts` (`createUser`, `createRestaurant`, …). Next to them goes a login helper that returns a Supertest agent with the cookies (`request.agent(app)`).

## What to test for each endpoint
- The happy path: status and body shape.
- The error cases:
  - `400` for invalid input (check `details.fieldErrors`);
  - `401` when logged out;
  - `403` for the wrong role;
  - `404` for someone else's resource;
  - `409` for conflicts.
- What is in the database after the call, not only the response.

## Good tests
- **Pure logic** (`*.rules.ts`) gets unit tests without the database. Pass `now` in; never depend on the real clock.
- **Times:** use fixed dates written in Yerevan time, plus boundary cases: 23:30 Yerevan, overnight hours, back-to-back bookings, the cutoff minute.
- **No network:**
  - Integrations use fakes: email goes to the in-memory outbox, and Cloudinary, Places and Google are stubbed.
  - Rate limits are off in tests.
- **Expected 500s:** keep the output clean with `t.mock.method(console, 'error', () => {})`.
- **Test names** describe the behavior: `it('rejects a booking that overlaps an active one')`.
