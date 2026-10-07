# Dine Yerevan — Technical Tasks

Derived from `Dine-Yerevan-Roadmap.docx` (6 October 2026). One branch + one PR per step. Tick a box when its PR is merged; task IDs (e.g. `6.9`) can be referenced in commit messages.

## Conventions (every step)

- Backend layers (`backend/src/`, see README "Layered architecture"): `routes/<feature>.routes.ts` → `controllers/<feature>.controller.ts` → `services/<feature>.service.ts` → `repositories/<entity>.repository.ts` → `entities/<entity>.entity.ts`. Zod schemas go in `validators/<feature>.validators.ts`, outside APIs in `integrations/`, shared helpers in `utils/`, CLI scripts in `cli/`. Mount routers in `routes/index.ts`.
- Each layer only calls the one below: controllers never query the database, services never see `req`/`res`, repositories hold no business rules. Repository functions take an optional `manager` so services can combine them in one transaction.
- Schema changes only via migrations: `npm run migration:generate -- src/db/migrations/<Name>` → review SQL → `npm run migration:run`.
- IDs `uuid`; times `timestamptz` (UTC), converted from `Asia/Yerevan` at the API edge; status/role columns `varchar` + `@Check(...)` (no Postgres enums); relations typed `Relation<...>`.
- Validation: `validate({ body, query, params })` middleware; read parsed values from `res.locals`.
- Errors: `throw new HttpError(status, message, { code?, details? })`; the frontend gets them as `ApiError` with `status`, `code`, `details`.
- Transactions: inside `dataSource.transaction(async (manager) => …)` every query uses `manager`.
- Frontend: pages in `src/pages/`, feature code in `src/features/<feature>/` (`<feature>.api.ts`, hooks, components), shared UI in `src/components/`, shadcn in `src/components/ui/`.
- Frontend tests: every test file goes in `frontend/src/test/` (`<name>.test.ts(x)`; subfolders mirroring `src/` once there are many). Vitest runs only that folder. Use `renderRoute()` / `renderWithProviders()` from `src/test/render.tsx`, and MSW handlers for API calls.
- Every PR: lint + typecheck + tests green in CI; README endpoint table updated.

---

## Step 0 — Baseline

- [x] **0.1** Commit the current setup to `main` and push (`c78dc1c`).
- [ ] **0.2** `git switch -c feature/ui-foundation`.

## Step 1b — Finish setup · `feature/ui-foundation`

### Frontend
- [ ] **1b.1** Tailwind CSS v4: `npm i -D tailwindcss @tailwindcss/vite`; add `tailwindcss()` to `vite.config.ts`; `src/index.css` → `@import "tailwindcss";` + `@theme` tokens (brand `#b4232a`).
- [ ] **1b.2** `@/*` alias: `paths` in `tsconfig.json` + `tsconfig.app.json` (no `baseUrl` — deprecated in TS 6) and `resolve.alias` in `vite.config.ts`.
- [ ] **1b.3** `npx shadcn@latest init --base radix --preset vega --pointer`; add `button input label textarea field card dialog select popover calendar table badge tabs dropdown-menu skeleton sonner` (`field` replaces the retired `form`; use it with React Hook Form's `Controller`).
  - `npx shadcn eject`: shadcn's Tailwind helpers copied to `src/styles/shadcn.css`, so the shadcn CLI (with a vulnerable `braces` dependency) isn't installed in the project.
  - Theme in `src/index.css`: brand red `#b4232a` as `--primary`/`--ring`, Tailwind stone grays, light only (`@custom-variant dark` keeps OS dark mode from leaking in).
  - `sonner.tsx` fixed to `theme="light"` (`next-themes` removed); MSW install script denied (`allowScripts`).
- [ ] **1b.4** `eslint.config.js`: disable `react-refresh/only-export-components` for `src/components/ui/**`.
- [ ] **1b.5** Restyle `RootLayout`, `HomePage`, `NotFoundPage` with Tailwind; delete `RootLayout.module.css`; mount `<Toaster />`.
- [ ] **1b.6** TanStack Query: `npm i @tanstack/react-query`; `src/lib/query-client.ts`; wrap `RouterProvider` in `QueryClientProvider` (`App.tsx`); convert `ApiStatus` to `useQuery`.
- [ ] **1b.7** Forms: `npm i react-hook-form zod @hookform/resolvers`.
- [ ] **1b.8** MSW: `npm i -D msw`; `src/test/msw/{server,handlers}.ts`; listen/reset/close in `src/test/setup.ts`; move `routes.test.tsx` from the `fetch` stub to MSW.

### Backend
- [ ] **1b.9** `npm i zod cookie-parser date-fns @date-fns/tz`, `npm i -D @types/cookie-parser`; `app.use(cookieParser())` in `app.ts`.
- [ ] **1b.10** `src/middlewares/validate.ts`: Zod parse of body/query/params; failure → 400 `Validation failed` with `details: { location, fieldErrors, formErrors }`; success → `res.locals.body|query|params` (Express 5 `req.query` is read-only).
- [ ] **1b.11** `src/config/env.ts`: `db.ssl` (`DB_SSL`, used in `data-source.ts`), `appUrl` (`APP_URL`); update `.env.example`. (The "secret required in production" helper moves to 2.5, where the first secret appears.)
- [ ] **1b.12** `src/utils/http-error.ts`: options `{ details, code }`; `error-handler.ts` returns `{ error: { message, code?, details? } }` (code only from `HttpError`). Frontend `ApiError` got `code` too (was 6.11).

### Test infrastructure
- [ ] **1b.13** Test DB: `docker/initdb/01-create-test-db.sql` (`CREATE DATABASE dine_yerevan_test;`) mounted at `/docker-entrypoint-initdb.d` in `compose.yaml`; for an existing volume once: `npm run db:test:create`.
- [ ] **1b.14** `backend/package.json` test script: `NODE_ENV=test DB_NAME=dine_yerevan_test node … --test --test-concurrency=1 "tests/**/*.test.ts"`.
- [ ] **1b.15** `tests/helpers/db.ts`: `setupTestDb()` (initialize + `runMigrations()`), `resetDb()` (`TRUNCATE … RESTART IDENTITY CASCADE`; throws unless `current_database()` ends in `_test`), `closeTestDb()`. (`tests/helpers/factories.ts` starts in Step 2 with the first entity.)

### CI and docs
- [ ] **1b.16** `.github/workflows/ci.yml` on `pull_request` + push to `main`:
  - `backend`: service `postgres:18` (user/password `dine`, db `dine_yerevan_test`, `pg_isready` health check); Node 24 + npm cache; `npm ci`, `lint`, `typecheck`, `test`.
  - `frontend`: `npm ci`, `lint`, `typecheck`, `test`, `build`.
- [ ] **1b.17** README: CI badge, test DB setup, new libraries, empty "API endpoints" table.

## Step 1c — Layered backend · `refactor/layered-backend`

- [ ] **1c.1** Move the health feature from `src/modules/health/` into layers: `routes/health.routes.ts` → `controllers/health.controller.ts` → `services/health.service.ts` → `repositories/health.repository.ts` (the `SELECT 1` ping moves out of the service).
- [ ] **1c.2** `src/routes.ts` → `routes/index.ts`; `app.ts` imports it from there.
- [ ] **1c.3** `db/data-source.ts`: entities loaded from `src/entities/*.entity.{ts,js}`.
- [ ] **1c.4** README "Layered architecture": folder tree, rules between layers, transactions through `manager`, how to add a feature; task list paths updated.

## Step 1d — Frontend tests in one folder · `test/frontend-tests-folder`

- [ ] **1d.1** `src/routes.test.tsx` → `src/test/routes.test.tsx`; `vite.config.ts` `test.include: ['src/test/**/*.test.{ts,tsx}']`.
- [ ] **1d.2** `src/test/render.tsx`: add `renderWithProviders(ui)`; `renderRoute(path)` builds on it.
- [ ] **1d.3** New tests: `api-client.test.ts` (JSON, body, `ApiError` code/details, non-JSON errors), `api-status.test.tsx` (up / database down / unreachable), `query-client.test.ts` (`shouldRetry`).
- [ ] **1d.4** `lib/query-client.ts`: retry only network/5xx errors (`shouldRetry`); `ApiStatus` gets `role="status"`.

## Step 2 — Authentication · `feature/auth`

### Database
- [ ] **2.1** `entities/user.entity.ts`: `email` (unique, lowercase), `passwordHash` (nullable), `googleId` (unique, nullable), `name`, `role` (`CUSTOMER|OWNER|ADMIN`, default `CUSTOMER`), timestamps; `repositories/user.repository.ts` (`findByEmail`, `findByGoogleId`, `findById`, `create`, `update`).
- [ ] **2.2** `entities/refresh-token.entity.ts`: `user` (CASCADE), `tokenHash` (unique), `familyId`, `expiresAt`, `rotatedAt`, `revokedAt`; `repositories/refresh-token.repository.ts`.
- [ ] **2.3** `entities/password-reset-token.entity.ts`: `user` (CASCADE), `tokenHash` (unique), `expiresAt`, `usedAt`; `repositories/password-reset-token.repository.ts`.
- [ ] **2.4** Migration `CreateUsersAndAuthTokens`.

### Backend
- [ ] **2.5** `npm i jose arctic @node-rs/argon2 express-rate-limit`; env `JWT_ACCESS_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, read through a helper that throws in production when a secret is missing.
- [ ] **2.6** `services/token.service.ts`: `signAccessToken` (HS256; `sub`, `role`; 15 min), `verifyAccessToken`; `utils/crypto.ts`: `generateOpaqueToken` (32 random bytes, base64url), `hashToken` (SHA-256).
- [ ] **2.7** `utils/auth-cookies.ts` (used by controllers): set/clear `access_token` (Path `/api`, 15 min) and `refresh_token` (Path `/api/auth`, 30 days); `httpOnly`, `sameSite: 'lax'`, `secure` in production.
- [ ] **2.8** `utils/password.ts`: `hashPassword` / `verifyPassword` (`@node-rs/argon2` defaults = argon2id).
- [ ] **2.9** `services/auth.service.ts`: `register`, `login` (generic 401), `issueSession(user, familyId?)`, `logout` (revoke current token), `refresh`:
  - atomic `UPDATE refresh_tokens SET "rotatedAt" = now() WHERE "tokenHash" = $1 AND "rotatedAt" IS NULL AND "revokedAt" IS NULL AND "expiresAt" > now() RETURNING *` (in `refresh-token.repository.ts`) → new token in the same family;
  - token rotated < 30 s ago → issue new tokens (concurrent tabs);
  - otherwise (reuse) → revoke the whole family → 401.
- [ ] **2.10** `src/middlewares/auth.ts`: `requireAuth` (cookie → verify → load user → `req.user`), `requireRole(...roles)` (403), `optionalAuth`; typing in `src/types/express.d.ts`.
- [ ] **2.11** Google OAuth with Arctic (`integrations/google-oauth.ts` wraps Arctic; handlers in `controllers/auth.controller.ts`; `findOrCreateGoogleUser` in `services/auth.service.ts`):
  - `GET /api/auth/google`: `generateState()`, `generateCodeVerifier()` → cookies `google_oauth_state`, `google_code_verifier` (httpOnly, lax, 10 min) → redirect to `createAuthorizationURL(state, verifier, ['openid', 'profile', 'email'])`.
  - `GET /api/auth/google/callback`: check `state` → `validateAuthorizationCode(code, verifier)` → `decodeIdToken(tokens.idToken())` → `findOrCreateGoogleUser({ sub, email, email_verified, name })` (by `googleId` → link verified email → create `CUSTOMER`) → `issueSession` → redirect `APP_URL`; on error → `APP_URL/login?error=google`.
- [ ] **2.12** `POST /api/auth/forgot-password` (always 204; token 1 h, stored hashed; email link `APP_URL/reset-password?token=…`) and `POST /api/auth/reset-password` (valid + unused → new hash, mark used, revoke all refresh tokens).
- [ ] **2.13** `integrations/email.ts`: `sendEmail({ to, subject, html, text })`; console transport (dev), in-memory outbox (tests); Resend joins in 9.1.
- [ ] **2.14** `validators/auth.validators.ts` + `routes/auth.routes.ts` / `controllers/auth.controller.ts`: `POST register|login|logout|refresh|forgot-password|reset-password`, `GET me|google|google/callback`; mount in `routes/index.ts`.
- [ ] **2.15** Rate limits on login/register/forgot-password (`skip` when `env.isTest`).
- [ ] **2.16** Error handler: unique violation `23505` → 409.
- [ ] **2.17** CLI `src/cli/create-admin.ts` + script `user:create-admin` (`parseArgs`: `--email --password --name`).

### Frontend
- [ ] **2.18** `features/auth/auth.api.ts`; hooks `useMe` (`['me']`, 401 → `null`), `useLogin`, `useRegister`, `useLogout`.
- [ ] **2.19** `lib/api-client.ts`: on 401 → one shared `POST /api/auth/refresh` → retry once; refresh fails → set `['me']` to `null` (skip for `/auth/login`, `/auth/refresh`).
- [ ] **2.20** `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage` (RHF + Zod + shadcn `Form`); "Continue with Google" → link to `/api/auth/google`; show `?error=google`.
- [ ] **2.21** `components/RequireRole.tsx` (layout route: loading / redirect to `/login` with `from` / 403 page); header user menu (name, role links, logout).

### Tests and docs
- [ ] **2.22** `tests/auth.test.ts`: register (201 + cookies; duplicate 409), login (wrong password 401), `me`, refresh rotation, concurrent refresh within 30 s, reuse after grace → family revoked, logout, `requireRole` 403, reset token single-use (link from outbox), `findOrCreateGoogleUser` unit tests.
- [ ] **2.23** Frontend: login form validation + submit (MSW); `RequireRole` redirect.
- [ ] **2.24** README: auth endpoints; Google OAuth client (redirect URI `http://localhost:5173/api/auth/google/callback`).

## Step 3 — Restaurants · `feature/restaurants`

### Database
- [ ] **3.1** `utils/districts.ts`: Ajapnyak, Arabkir, Avan, Davtashen, Erebuni, Kanaker-Zeytun, Kentron, Malatia-Sebastia, Nor Nork, Nork-Marash, Nubarashen, Shengavit.
- [ ] **3.2** `entities/restaurant.entity.ts`: `owner` (OneToOne `User`, nullable, unique `ownerId`), `name`, `slug` (unique), `description`, `address`, `district` (CHECK), `lat`, `lng`, `phone`, `website`, `priceLevel` (1–4, nullable), `status` (`PENDING|PUBLISHED|REJECTED|UNPUBLISHED`), `googlePlaceId` (unique, nullable), `ratingAvg` (numeric(3,2), 0), `ratingCount` (0), timestamps, booking settings:
  - `slotStepMinutes` 30, `defaultDurationMinutes` 120, `minDurationMinutes` 60, `maxDurationMinutes` 240, `bookingWindowDays` 30, `minNoticeMinutes` 60, `cancelCutoffMinutes` 120.
- [ ] **3.3** `entities/restaurant-photo.entity.ts` (`url`, `publicId`, `position`; CASCADE); `entities/opening-hour.entity.ts` (`dayOfWeek` 1–7, `opensAt`, `closesAt` as `time`; CASCADE).
- [ ] **3.4** Migration `CreateRestaurants` (+ indexes on `status`, `district`).

### Backend
- [ ] **3.5** `src/utils/slug.ts` (slugify + unique suffix).
- [ ] **3.6** `validators/restaurant.validators.ts`: list query `q`, `district`, `priceLevel`, `sort` (`name|newest`), `page`, `limit` (≤ 50).
- [ ] **3.7** `repositories/restaurant.repository.ts` holds the queries and `services/restaurant.service.ts` turns results into DTOs: `listPublished` (QueryBuilder: `status = 'PUBLISHED'`, `name ILIKE`, filters, sort, `skip/take`, `getManyAndCount`, cover photo) and `getPublishedBySlug` (photos by `position`, hours sorted) → DTOs without owner data.
- [ ] **3.8** `routes/restaurant.routes.ts` + `controllers/restaurant.controller.ts`: `GET /api/restaurants`, `GET /api/restaurants/:slug`.
- [ ] **3.9** `src/cli/seed.ts` + script `seed`: idempotent (upsert by slug); ~10 restaurants across districts with hours and photo URLs; demo owner accounts for the complete ones.

### Frontend
- [ ] **3.10** `features/restaurants/restaurants.api.ts`; `useRestaurants(params)`, `useRestaurant(slug)`.
- [ ] **3.11** `pages/RestaurantsPage.tsx`: debounced search, district + price selects, state in `useSearchParams`, `RestaurantCard` grid, pagination, loading/empty/error states.
- [ ] **3.12** `pages/RestaurantPage.tsx`: gallery, info, opening hours (overnight shown as `18:00–02:00`), "online booking not available" banner.
- [ ] **3.13** Home page hero search → `/restaurants?q=…`.

### Tests
- [ ] **3.14** API: filters, pagination, sorting, unpublished hidden, unknown slug 404.
- [ ] **3.15** Frontend: list page keeps filters in the URL (MSW).

## Step 4 — Owner sign-up and dashboard · `feature/owner-dashboard`

### Backend
- [ ] **4.1** `routes/owner.routes.ts` → `controllers/owner.controller.ts` → `services/owner.service.ts`. `POST /api/owner/restaurant` (`requireAuth`; user has no restaurant): transaction → role `CUSTOMER → OWNER` + restaurant `PENDING` → re-issue session cookies (new role in the JWT).
- [ ] **4.2** `middlewares/require-own-restaurant.ts`: `requireRole('OWNER')` + restaurant by `ownerId` (via `owner.service.ts`) → `req.restaurant` (404 if none).
- [ ] **4.3** `GET /api/owner/restaurant`, `PATCH /api/owner/restaurant` (info), `PATCH /api/owner/restaurant/settings` (min ≤ default ≤ max; multiples of the slot step).
- [ ] **4.4** Cloudinary: `npm i cloudinary`; env `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`; `integrations/cloudinary.ts` (signing, deleting) + `repositories/restaurant-photo.repository.ts`:
  - `POST /api/owner/restaurant/photos/signature` → `cloudinary.utils.api_sign_request({ timestamp, folder: 'dine-yerevan/restaurants/<id>' }, secret)`;
  - `POST /api/owner/restaurant/photos` (reject a `publicId` outside the folder);
  - `DELETE /api/owner/restaurant/photos/:id` (+ `cloudinary.uploader.destroy`);
  - `PATCH /api/owner/restaurant/photos/order`.
- [ ] **4.5** CLI `src/cli/approve-restaurant.ts` + script `restaurant:approve -- <slug>` (`PENDING → PUBLISHED`).

### Frontend
- [ ] **4.6** `pages/RegisterRestaurantPage.tsx` (`/register/restaurant`): logged out → account + restaurant fields (register, then create); logged-in customer → restaurant fields only.
- [ ] **4.7** `pages/dashboard/DashboardLayout.tsx` (sidebar) under `<RequireRole role="OWNER">`; `DashboardOverviewPage` (pending banner).
- [ ] **4.8** `RestaurantInfoPage` (RHF form), `PhotosPage` (signature → upload to `https://api.cloudinary.com/v1_1/<cloud>/image/upload` → save; delete; reorder), `SettingsPage` (booking rules).

### Tests and docs
- [ ] **4.9** API: create → `OWNER` + `PENDING`; second create 409; pending not public; owner sees only own restaurant; signature requires owner; foreign `publicId` rejected; approve publishes.
- [ ] **4.10** README: owner endpoints, Cloudinary setup.

## Step 5 — Tables, opening hours, blocks · `feature/tables-hours-blocks`

### Database
- [ ] **5.1** `entities/dining-table.entity.ts` (+ `repositories/dining-table.repository.ts`): `restaurant`, `name`, `minCapacity` (default 1), `capacity`, `isActive` (default true); `@Check('"minCapacity" >= 1 AND "minCapacity" <= "capacity"')`; `@Unique(['restaurant', 'name'])`.
- [ ] **5.2** `entities/block.entity.ts` (+ `repositories/block.repository.ts`): `restaurant`, `table` (nullable = whole restaurant), `startsAt`, `endsAt`, `reason`; CHECK `"startsAt" < "endsAt"`; index (`restaurantId`, `startsAt`).
- [ ] **5.3** Migration `CreateTablesAndBlocks`.

### Backend
- [ ] **5.4** Tables (`table.routes.ts` / `table.controller.ts` / `table.service.ts`): `GET|POST /api/owner/restaurant/tables`, `PATCH|DELETE /api/owner/restaurant/tables/:id`.
- [ ] **5.5** `services/opening-hours.rules.ts` (pure functions, no database): `expandWeek(periods)` (`closesAt <= opensAt` → ends next day; Sunday wraps to Monday), `findOverlaps(periods)`.
- [ ] **5.6** `GET|PUT /api/owner/restaurant/hours` (PUT replaces the week in one transaction; overlaps → 400).
- [ ] **5.7** Blocks: `GET /api/owner/restaurant/blocks?from&to`, `POST` (date/time or all-day in Yerevan time → UTC; table must belong to the restaurant), `DELETE /:id`.
- [ ] **5.8** Error handler: check violation `23514` → 400.

### Frontend
- [ ] **5.9** `TablesPage`: list, add/edit dialog, active switch, delete.
- [ ] **5.10** `HoursPage`: weekly grid, add/remove periods, "ends next day" hint, empty day = closed.
- [ ] **5.11** `BlocksPage`: upcoming list; create dialog (whole restaurant / table, dates, all-day toggle, times, reason).

### Tests
- [ ] **5.12** Unit `opening-hours.ts`: same-day overlap, overnight into the next day, Sunday → Monday wrap, 24-hour period.
- [ ] **5.13** API: table CHECK/UNIQUE, ownership, block validation.
- [ ] **5.14** Seed: tables + hours for the demo restaurants.

## Step 6 — Availability and booking · `feature/reservations`

### Database
- [ ] **6.1** `entities/reservation.entity.ts` (+ `repositories/reservation.repository.ts`, every function taking `manager`): `restaurant`, `table` (`onDelete: 'RESTRICT'`), `customer` (nullable), `source` (`ONLINE|PHONE|WALK_IN`), `guestName`, `guestPhone`, `partySize` (> 0), `startsAt`, `endsAt` (CHECK start < end), `status` (`PENDING|CONFIRMED|ARRIVED|NO_SHOW|CANCELLED`, default `PENDING`), `note` (≤ 500), `cancelledBy` (`CUSTOMER|RESTAURANT`), `cancelReason`, `confirmedAt`, `cancelledAt`, timestamps; indexes (`restaurantId`, `startsAt`), (`customerId`, `startsAt`).
- [ ] **6.2** Exclusion constraints on the entity:
  ```ts
  @Exclusion('reservations_no_overlap', `USING gist ("tableId" WITH =, tstzrange("startsAt", "endsAt", '[)') WITH &&) WHERE (status IN ('PENDING', 'CONFIRMED', 'ARRIVED'))`)
  @Exclusion('reservations_customer_no_overlap', `USING gist ("customerId" WITH =, tstzrange("startsAt", "endsAt", '[)') WITH &&) WHERE ("customerId" IS NOT NULL AND status IN ('PENDING', 'CONFIRMED', 'ARRIVED'))`)
  ```
- [ ] **6.3** Migration `CreateReservations`; add `CREATE EXTENSION IF NOT EXISTS btree_gist;` at the top of `up()`; review the generated SQL.

### Backend
- [ ] **6.4** `src/utils/yerevan-time.ts`: `YEREVAN_TZ`, `localToUtc(date, time)`, `utcToLocal`, Yerevan day-range helpers (`TZDate` from `@date-fns/tz`).
- [ ] **6.5** `services/availability.rules.ts` (pure functions, no database): `checkCustomerRules` (window, notice, slot alignment, duration range), `fitsOpeningHours` (incl. previous day's overnight period), `overlaps`, `filterCandidates` (active, `minCapacity <= guests <= capacity`), `sortBestFit`.
- [ ] **6.6** `services/availability.service.ts` (queries via `reservation.repository.ts` / `block.repository.ts`): `findFreeTables(manager, { restaurant, start, end, guests, tableId?, ignoreReservationId?, skipCustomerRules? })` (hours, overlapping blocks, active overlapping reservations via `tstzrange && tstzrange`) and `suggestTimes(...)` (±2 h in slot steps).
- [ ] **6.7** `isBookable` on restaurant DTOs (published, has owner, ≥ 1 active table, has hours).
- [ ] **6.8** `GET /api/restaurants/:slug/availability?date&time&guests&duration` → `{ tables, suggestions }`.
- [ ] **6.9** `routes/reservation.routes.ts` → `controllers/reservation.controller.ts` → `services/reservation.service.ts`. `POST /api/reservations` (`requireAuth`): `dataSource.transaction(manager => …)` → lock restaurant + table rows `setLock('pessimistic_read')` (FOR SHARE) → `findFreeTables` for the chosen table → insert `PENDING` → 201.
- [ ] **6.10** Error handler: `QueryFailedError` `23P01` by `driverError.constraint` → 409 `TABLE_TAKEN` / `CUSTOMER_OVERLAP`; FK violation `23503` on table delete → 409 ("switch it off instead").

### Frontend
- [ ] **6.11** `features/booking/booking.api.ts` (`getAvailability`, `createReservation`). (`ApiError.code` already exists since 1b.12.)
- [ ] **6.12** `features/booking/BookingWidget.tsx`: calendar (past + beyond window disabled), time (slot steps), guests, duration (min…max, default 2 h) → free tables (best fit preselected) or suggestion chips → phone + note → confirm (login redirect if needed) → `BookingSuccessPage`.

### Tests
- [ ] **6.13** Unit `availability.ts`: overnight, multiple periods, crossing closing time, restaurant/table blocks, min capacity, notice, window, slot alignment, duration limits, back-to-back.
- [ ] **6.14** API: best-fit order, suggestions when full, POST → `PENDING`, occupied table → 409 `TABLE_TAKEN`, 400/401 cases.
- [ ] **6.15** Seed: sample reservations.

## Step 7 — Double-booking guarantee · `feature/double-booking`

- [ ] **7.1** `data-source.ts`: `poolSize: 20`, `connectTimeoutMS: 5000` when `env.isTest`.
- [ ] **7.2** 409 body: `code` + `detectedBy` (`availability-check` | `database-constraint`).
- [ ] **7.3** `tests/reservations.concurrency.test.ts`: 10 customers, 10 parallel `POST /api/reservations` (`Promise.all`) → exactly 1 × 201, 9 × 409 `TABLE_TAKEN`, 1 active row in the DB.
- [ ] **7.4** `tests/reservations.constraint.test.ts` (two `QueryRunner`s): A inserts without committing → B's overlapping insert still pending after ~200 ms → A commits → B rejects with `23P01` (`reservations_no_overlap`).
- [ ] **7.5** Overlap tests: partial overlap rejected, back-to-back allowed, `CANCELLED` / `NO_SHOW` free the table, customer overlap → `CUSTOMER_OVERLAP`.
- [ ] **7.6** Block creation in a transaction with `setLock('pessimistic_write')` (FOR UPDATE) on the table row (table block) or restaurant row (restaurant block); test that it waits for an open booking transaction.
- [ ] **7.7** Frontend: `TABLE_TAKEN` → toast + invalidate the availability query; `CUSTOMER_OVERLAP` → message.
- [ ] **7.8** `docs/availability-and-double-booking.md` with a Mermaid sequence diagram of two racing requests; link from the README.

## Step 8 — Reservation management · `feature/reservation-management`

### Backend
- [ ] **8.1** `services/reservation-status.rules.ts`: transitions table (actor, from, to, time guard) + `assertTransition()`:
  - customer: `PENDING|CONFIRMED → CANCELLED` and reschedule, until `cancelCutoffMinutes` before the start;
  - restaurant: `PENDING → CONFIRMED`; `PENDING|CONFIRMED → CANCELLED` (reason required); `→ ARRIVED` from start − 30 min; `→ NO_SHOW` only after the start; `ARRIVED ↔ NO_SHOW` on the same Yerevan day.
- [ ] **8.2** Customer: `GET /api/me/reservations?scope=upcoming|past`, `POST /api/reservations/:id/cancel`, `PATCH /api/reservations/:id` (reschedule in a transaction: `findFreeTables` with `ignoreReservationId` → update → `PENDING`).
- [ ] **8.3** Owner: `GET /api/owner/restaurant/reservations?date&status` (Yerevan day via `AT TIME ZONE 'Asia/Yerevan'`), `PATCH /api/owner/restaurant/reservations/:id/status` (`{ status, reason? }`).
- [ ] **8.4** Owner phone/walk-in: `POST /api/owner/restaurant/reservations` (`guestName`, `guestPhone`, `tableId`, start, duration, guests, `source`) with `skipCustomerRules`; status `CONFIRMED` (`ARRIVED` for walk-ins).
- [ ] **8.5** Block creation response lists overlapping active reservations.

### Frontend
- [ ] **8.6** `pages/MyReservationsPage.tsx` (`/me/reservations`): Upcoming/Past tabs, status badges, cancel (confirm dialog), reschedule (dialog reusing the availability search), cancellation reason shown.
- [ ] **8.7** `pages/dashboard/ReservationsPage.tsx`: date picker, status filter, rows (time, table, guests, name, phone, note, status), actions per allowed transition (cancel → reason dialog), "needs attention" highlight, "Add phone / walk-in booking" dialog.
- [ ] **8.8** Dashboard overview: today's bookings; `BlocksPage` shows overlap warnings.

### Tests
- [ ] **8.9** Unit: every transition and time guard.
- [ ] **8.10** API: cancel before/after cutoff, reschedule success/conflict, reason required, `NO_SHOW` before the start rejected, walk-in for "now" accepted but hours/blocks/constraint still apply, another owner → 404, day list timezone boundary (23:30 Yerevan).
- [ ] **8.11** Frontend: cancel flow on My reservations (MSW).
- [ ] **8.12** Manual: full demo story locally.

## Step 9 — Final features (one PR each, in this order)

### 9.1 Emails · `feature/emails`
- [ ] **9.1.1** `npm i resend`; env `RESEND_API_KEY`, `EMAIL_FROM`; Resend transport in `integrations/email.ts`, used when the key is set.
- [ ] **9.1.2** `services/notification.service.ts` with the templates (HTML + text): booking received (customer), new booking (restaurant owner), confirmed, cancelled (with reason), password reset.
- [ ] **9.1.3** Send after the transaction commits; catch + log failures.
- [ ] **9.1.4** Tests: outbox for create/confirm/cancel; a failing transport still returns 201.

### 9.2 Reviews · `feature/reviews`
- [ ] **9.2.1** `entities/review.entity.ts` (+ `repositories/review.repository.ts`): `restaurant`, `user`, `reservation` (unique), `rating` (CHECK 1–5), `comment` (≤ 1000); migration.
- [ ] **9.2.2** `POST /api/reservations/:id/review` (own reservation, `ARRIVED`, no review yet) → transaction: insert + recompute `ratingAvg` / `ratingCount`.
- [ ] **9.2.3** `GET /api/restaurants/:slug/reviews?page`; restaurant list: `minRating` filter + `sort=rating`.
- [ ] **9.2.4** Frontend: review dialog on past `ARRIVED` reservations, reviews on `RestaurantPage`, rating on cards, min-rating filter.
- [ ] **9.2.5** Seed reviews; tests: only `ARRIVED`, only own, one per reservation (409), aggregates.

### 9.3 Maps · `feature/maps`
- [ ] **9.3.1** Google Cloud: enable Maps JavaScript API; browser key restricted by referrer (`localhost:5173`, Vercel domain); create a Map ID.
- [ ] **9.3.2** `npm i @vis.gl/react-google-maps`; env `VITE_GOOGLE_MAPS_API_KEY`, `VITE_GOOGLE_MAP_ID`.
- [ ] **9.3.3** `RestaurantMap` (`AdvancedMarker`) on `RestaurantPage`; `ResultsMap` next to the list (markers for current results, click → restaurant); fallback when the key is missing.

### 9.4 Favorites · `feature/favorites`
- [ ] **9.4.1** `entities/favorite.entity.ts` (+ `repositories/favorite.repository.ts`) (composite PK `userId` + `restaurantId`, `createdAt`); migration.
- [ ] **9.4.2** `PUT|DELETE /api/me/favorites/:restaurantId`, `GET /api/me/favorites`; `isFavorite` in DTOs via `optionalAuth`.
- [ ] **9.4.3** Frontend: heart toggle (optimistic update), `/me/favorites` page; tests (idempotent PUT/DELETE, auth required).

### 9.5 Google Places import + claims · `feature/places-import`
- [ ] **9.5.1** Google Cloud: enable Places API (New); server key; env `GOOGLE_PLACES_API_KEY`.
- [ ] **9.5.2** `cli/import-places.ts` + script `import:places`, calling `integrations/google-places.ts`: per district `POST https://places.googleapis.com/v1/places:searchText` (`textQuery`, `includedType: 'restaurant'`, `pageSize: 20`, `pageToken`) with header `X-Goog-FieldMask: places.id,places.displayName,places.formattedAddress,places.location,places.priceLevel,places.regularOpeningHours,places.nationalPhoneNumber,places.websiteUri,places.addressComponents,nextPageToken`.
- [ ] **9.5.3** Pure mappers in `integrations/google-places.ts` (district, `PRICE_LEVEL_*` → 1–4, opening periods with Google day `0` = Sunday → `7`) + upsert by `googlePlaceId` (`PUBLISHED`, no owner; never overwrite restaurants that have an owner).
- [ ] **9.5.4** `entities/restaurant-claim.entity.ts` (+ `repositories/restaurant-claim.repository.ts`) (`restaurant`, `user`, `status` `PENDING|APPROVED|REJECTED`, `decidedAt`); migration.
- [ ] **9.5.5** `GET /api/restaurants/claimable?q`, `POST /api/owner/claims`; CLI `claim:approve -- <id>` (sets `ownerId`, rejects other pending claims).
- [ ] **9.5.6** `RegisterRestaurantPage`: "already listed?" search → claim or create; dashboard shows "claim pending".
- [ ] **9.5.7** Tests: mappers with a saved JSON fixture (no network); claim approve/reject.

### 9.6 Admin panel · `feature/admin`
- [ ] **9.6.1** `routes/admin.routes.ts` → `controllers/admin.controller.ts` → `services/admin.service.ts`, all behind `requireRole('ADMIN')`: `GET /api/admin/approvals`, `POST /api/admin/restaurants/:id/approve|reject`, `POST /api/admin/claims/:id/approve|reject`, `GET /api/admin/restaurants?q&status`, `PATCH /api/admin/restaurants/:id` (fields, `PUBLISHED|UNPUBLISHED`).
- [ ] **9.6.2** Frontend `/admin/approvals`, `/admin/restaurants` (+ edit dialog) under `<RequireRole role="ADMIN">`.
- [ ] **9.6.3** Tests: non-admin 403, approve/reject, unpublish hides from the public list.

### 9.7 Owner stats · `feature/owner-stats`
- [ ] **9.7.1** `repositories/stats.repository.ts` (the `GROUP BY` queries) + `services/stats.service.ts`. `GET /api/owner/restaurant/stats?from&to`: bookings per Yerevan day, guests served (`ARRIVED`), no-show rate, cancellation rate, bookings per hour, per source — `GROUP BY` with `AT TIME ZONE 'Asia/Yerevan'`.
- [ ] **9.7.2** `npm i recharts`; `/dashboard/stats`: period picker, KPI cards, line chart (per day), bar chart (per hour).
- [ ] **9.7.3** Tests: aggregates incl. a timezone boundary.

### 9.8 Stretch — availability search · `feature/availability-search`
- [ ] **9.8.1** `GET /api/restaurants` accepts `date`, `time`, `guests`, `duration` → only restaurants with ≥ 1 free table (reuse `findFreeTables`).
- [ ] **9.8.2** List page: optional date/time/guests filter row; tests.

## Step 10 — Deploy · `chore/deploy`

- [ ] **10.1** `data-source.ts`: `ssl` from `DB_SSL`, `migrationsRun: env.isProduction`.
- [ ] **10.2** `app.ts`: `app.set('trust proxy', env.trustProxyHops)` (`TRUST_PROXY_HOPS`); measure with a temporary `GET /api/debug/ip`, then remove it.
- [ ] **10.3** `env.ts`: fail fast when a production secret is missing.
- [ ] **10.4** Neon: project + database; connection values → Render env; `DB_SSL=true`.
- [ ] **10.5** Render web service: root `backend`; Node 24 pinned (`NODE_VERSION=24` or `.node-version`); build `npm ci --include=dev && npm run build`; start `npm start`; health check `/api/health`; env `NODE_ENV=production`, `APP_URL`, `DB_*`, `DB_SSL`, `JWT_ACCESS_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `CLOUDINARY_*`, `RESEND_API_KEY`, `EMAIL_FROM`, `GOOGLE_PLACES_API_KEY`, `TRUST_PROXY_HOPS`.
- [ ] **10.6** Vercel: root `frontend`; env `VITE_GOOGLE_MAPS_API_KEY`, `VITE_GOOGLE_MAP_ID`; `frontend/vercel.json`:
  ```json
  {
    "rewrites": [
      { "source": "/api/:path*", "destination": "https://<service>.onrender.com/api/:path*" },
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
- [ ] **10.7** Google Cloud: production redirect URI `https://<app>.vercel.app/api/auth/google/callback`; publish the OAuth consent screen "In production"; add the Vercel domain to the Maps key referrers.
- [ ] **10.8** Run `seed` and `import:places` against Neon (temporary, uncommitted env file).
- [ ] **10.9** Live smoke test: register, Google login, search, book, owner confirm/arrived, review, emails, maps; README: live URLs.

## Step 11 — Polish and defense · `chore/polish`

- [ ] **11.1** README: full endpoint table, setup, architecture diagram (Mermaid), env var table, screenshots.
- [ ] **11.2** Responsive check (375 px), empty/loading/error states, 403/404 pages, basic accessibility (labels, focus, contrast).
- [ ] **11.3** No secrets in the frontend bundle (`grep` the built `dist/`); remove debug code.
- [ ] **11.4** Rehearse: run the concurrency and constraint tests live; walk through `docs/availability-and-double-booking.md`.
