# Dine Yerevan — Build Roadmap

Yerevan Restaurant Reservation Platform · final project plan  
Plan agreed on 6 October 2026 · Timeline: 4–6 weeks

**Stack** — Frontend: React 19 · Vite 8 · React Router 8 · TypeScript · Tailwind CSS + shadcn/ui · TanStack Query. Backend: Node.js 24 · Express 5 · TypeScript · TypeORM · REST API. Database: PostgreSQL 18 (Docker locally, Neon in production). Services: Google OAuth · Google Places · Google Maps · Cloudinary · Resend · Vercel · Render.

## Contents

1. Overview
2. How we work
3. Decisions at a glance
4. Roadmap, step by step
5. Data model
6. How availability and double-booking prevention work
7. Schedule
8. Accounts and keys you will need
9. Getting started: commit the baseline
10. Sources checked while planning

> How to use this document: every step is one Git branch and one pull request. Tick the “Done when” boxes before you merge. Section 6 is your script for explaining availability and double-booking prevention to the graders.

## 1. Overview

Dine Yerevan is a web platform where people discover restaurants in Yerevan and reserve tables online. Customers browse, search, book and review. Restaurants manage their information, tables, opening hours and reservations from a private dashboard.

#### The story to demo

1. A customer finds a restaurant (search, filters, map).
2. They choose a date, time, number of guests and how long they want to stay.
3. They see the tables that are free and reserve one.
4. The restaurant sees the booking in its dashboard, confirms it and later marks the guest as arrived.
5. The customer leaves a review.

#### What the graders will focus on

Above all: **how availability is calculated and how double booking is prevented** (Section 6). Also React, Node.js/Express, REST APIs, PostgreSQL, authentication, roles, CRUD, database relationships, API integrations, business logic, testing and Git.

#### Timeline

4–6 weeks. The plan targets 5 weeks of building plus 1 buffer week (Section 7).

#### Already done — Step 1: project setup (not committed yet)

- Backend: Node.js 24, Express 5, TypeScript 6.0, TypeORM 1.1 (chosen instead of Prisma), migrations only, layered folders under `backend/src/` (routes → controllers → services → repositories).
- Frontend: Vite 8, React 19, React Router 8, TypeScript, a small `api-client.ts`, Vite proxy from `/api` to the backend.
- Database: PostgreSQL 18 in Docker (`compose.yaml`, port 5432).
- Tests: `node:test` + Supertest (backend), Vitest + Testing Library (frontend).

## 2. How we work

- **Work style:** Claude writes the code for each step and explains how it works. You run it, test it, review it and commit it.
- **Git:** one branch per step (the name is listed in each step) → pull request on GitHub → GitHub Actions runs lint, typecheck, tests and build → you merge. You run every git command yourself; Claude gives you the exact commands.
- **Checklists:** each step ends with “Done when” boxes. Tick them before merging.
- **Language:** the website is English only.
- **API documentation:** an endpoint table in the README, updated in every step.

## 3. Decisions at a glance

Everything below was chosen by you during planning. The steps in Section 4 follow these decisions.

| Area | Decision |
| --- | --- |
| Styling | Tailwind CSS v4 + shadcn/ui components |
| Data loading | TanStack Query (caching, loading/error states, refetch after changes) |
| Validation | Zod on the backend (validation middleware) and in frontend forms with React Hook Form |
| Languages | English only |
| Login methods | Email + password, and Google OAuth (Arctic library, redirect flow with PKCE) |
| Sessions | Access JWT (15 min) + rotating refresh token (30 days), both in httpOnly cookies |
| Roles | CUSTOMER, OWNER, ADMIN |
| Restaurant owners | Sign up and create a restaurant (after the Google import, they can also claim an imported one); an admin approves |
| Account extras | Password reset by email; no profile page (phone is entered with each booking) |
| Search and filters | Name search, district, price level; minimum rating once reviews exist |
| Real restaurants | Hand-made seed data first; Google Places import script (`npm run import:places`) in Step 9 |
| Dashboard | One owner manages one restaurant; photos uploaded to Cloudinary (signed uploads) |
| Tables | Name, max capacity, minimum guests, active on/off |
| Opening hours | Several periods per day; a period may end after midnight |
| Blocking | Block one table or the whole restaurant for any time range |
| Booking flow | Date + time + guests + duration → free tables (best fit first) → pick one → book |
| Duration | Customer chooses; default 2 hours, allowed 1–4 hours (set per restaurant) |
| Confirmation | New bookings are PENDING (already holding the table) until the restaurant confirms |
| Booking rules | Per restaurant: 30-minute slots, book up to 30 days ahead, at least 1 hour before; customers can cancel or reschedule until 2 hours before |
| Double booking | PostgreSQL exclusion constraint + transaction + 409 Conflict + concurrency test |
| Management extras | Phone/walk-in bookings, special-request note, cancellation reason, customer reschedule |
| Reservation view | Day list in the dashboard; nothing happens automatically |
| Reviews | Only after a visit (reservation marked ARRIVED), one per visit |
| Emails | Resend: booking received (customer + restaurant), confirmed/cancelled (customer), password reset |
| Maps | Google Maps on the details page and next to the restaurant list |
| Admin panel | Approvals + manage all restaurants |
| Analytics | Stats page for restaurant owners |
| Hosting | Vercel (frontend) + Render (backend) + Neon (PostgreSQL); first deploy at the start of the last week |
| Testing | Backend API + database tests (including the double-booking race), key frontend tests, all in CI |
| Domain | Decide later (only a settings change) |
| Final features order | Emails → Reviews → Maps → Favorites → Google Places import + claims → Admin → Owner stats → (stretch) availability search |
| Backend structure | Layered folders: routes → controllers → services → repositories → entities (plus validators, middlewares, integrations, utils) |

## 4. Roadmap, step by step

Steps follow the order in the project description. Step 1 (setup) is done; “1b” finishes it with the libraries chosen above.

### Step 1b — Finish the setup

_Branch: feature/ui-foundation · Week 1_

**Goal:** the tools every later step needs.

**Tasks**

- Frontend: Tailwind CSS v4 (`@tailwindcss/vite`) and shadcn/ui with the base components (button, input, form, dialog, select, calendar, table, badge, card, toasts); restyle the layout.
- Frontend: TanStack Query provider in `App.tsx`, React Hook Form + Zod, and MSW to fake the API in tests.
- Backend: a `validate()` middleware that checks body, query and params with Zod, keeps the cleaned values in `res.locals` (Express 5 doesn’t allow replacing `req.query`) and answers 400 with field errors (the existing error handler already sends the details).
- Backend: `cookie-parser`, `date-fns` + `@date-fns/tz`, and new settings in `env.ts` (`DB_SSL`, `APP_URL` and the secrets added in later steps).
- Test database `dine_yerevan_test` in the same Docker container:
  - The test script sets `DB_NAME=dine_yerevan_test`, and the clean-up helper refuses to run unless the database name ends in `_test` — so tests can never wipe your development data.
  - Helpers connect, run migrations, empty the tables between tests and close the connection at the end; backend test files run one at a time because they share the database.
- CI: `.github/workflows/ci.yml` with a backend job (PostgreSQL 18 service: lint, typecheck, migrate, test) and a frontend job (lint, typecheck, test, build) on every pull request and push to main.
- Small setup details: switch off the react-refresh lint rule for `src/components/ui/**` (shadcn files export helpers next to components) and configure the `@/` import alias with `paths` only — TypeScript 6 deprecates `baseUrl`.

**Done when**

- [ ] CI is green on the pull request
- [ ] The home page uses the new Tailwind / shadcn styling
- [ ] All existing tests still pass

### Step 2 — Authentication

_Branch: feature/auth · Week 1_

**Goal:** people register, log in with a password or with Google, stay logged in safely, and can reset a forgotten password.

**Tasks**

- Database: `User` (email, password hash, Google ID, name, role), `RefreshToken`, `PasswordResetToken`.
- Endpoints under `/api/auth`: register, login, logout, refresh, me, forgot-password, reset-password, google, google/callback.
- Tokens:
  - Access token: a JWT (library `jose`) valid 15 minutes, in the httpOnly cookie `access_token`.
  - Refresh token: a random value valid 30 days, in the httpOnly cookie `refresh_token`; only its hash is stored.
  - Every refresh replaces the refresh token (rotation). Reusing an old one logs out that whole login family (theft detection).
  - Two tabs refreshing at the same moment must not look like theft: the old token is marked used in one atomic database update and stays accepted for about 30 seconds.
- Google login with Arctic:
  - Redirect to Google with a random `state` and a PKCE verifier.
  - The callback checks `state` and reads the ID token (Google ID, email, name).
  - Finds the user, links an account with the same verified email, or creates a new customer — then sets the same cookies as a password login and sends the browser back to `APP_URL`.
- Security: argon2id password hashing (`@node-rs/argon2`), rate limiting on login, register and forgot-password (switched off in tests, which all come from one address), one generic “invalid email or password” message.
- Roles: `requireAuth` and `requireRole(...)` middlewares; “is this my restaurant?” checks inside the services. CLI `npm run user:create-admin`.
- Password reset: a one-time token valid 1 hour, stored hashed. Until Step 9 the email is printed in the backend console.
- Frontend: login, register, forgot/reset password pages; “Continue with Google” button; `useMe()` hook and user menu; protected routes; automatic refresh in `api-client.ts` (on 401: refresh once, then retry).

**Tests**

- Register and login, refresh rotation, reuse detection, logout, 403 for the wrong role, single-use reset token.

**Done when**

- [ ] Password login and Google login both work locally
- [ ] Protected pages send logged-out users to the login page
- [ ] Users stay logged in after the 15-minute access token expires

### Step 3 — Restaurants

_Branch: feature/restaurants · Week 2_

**Goal:** real restaurants to browse, search and open.

**Tasks**

- Database: `Restaurant` (name, slug, description, address, district, location, phone, website, price level, status, Google place ID, booking settings, rating), `RestaurantPhoto`, `OpeningHour`.
- API: `GET /api/restaurants` with name search, district and price filters, sorting and pages; `GET /api/restaurants/:slug` (published restaurants only).
- Seed script `npm run seed`: about 10 hand-made restaurants (as the project description suggests for the start), several of them complete demo restaurants with owners, opening hours and photos. It grows in later steps (tables, reservations, reviews).
- Frontend: `/restaurants` list with filters kept in the URL, cards and pages; `/restaurants/:slug` details page with photos, info and opening hours (restaurants that can’t take bookings yet show “online booking not available”); search box on the home page.
- Real restaurants from Google Places come later, in Step 9 — exactly the order the project description suggests (“initially add a few manually, later integrate Google Places”).

**Tests**

- Filters and pages, unknown slug → 404, unpublished restaurants stay hidden.

**Done when**

- [ ] The list can be searched by name and filtered by district and price
- [ ] The details page shows photos, info and opening hours

### Step 4 — Owner sign-up and dashboard

_Branch: feature/owner-dashboard · Week 2_

**Goal:** restaurants get owners and a private dashboard.

**Tasks**

- “Register your restaurant” page: creates a new restaurant with status PENDING. Works when logged out (creates an owner account) or logged in (turns a customer, e.g. a Google user, into an owner). Claiming an imported restaurant is added together with the Google import in Step 9.
- Approval by CLI for now: `npm run restaurant:approve` (the admin panel replaces it in Step 9).
- Dashboard at `/dashboard` (owners only): overview (shows “waiting for approval” while pending), restaurant info form, photos, settings.
- Photos with Cloudinary: the backend signs each upload (the secret never leaves the server), the browser uploads straight to Cloudinary, the backend saves the URL; deleting a photo also deletes it in Cloudinary.
- Settings: slot step, default/min/max duration, how far ahead people can book, minimum notice, customer cancellation cutoff.
- Every `/api/owner/...` route finds “my restaurant” from the logged-in user, so an owner can never edit someone else’s restaurant.

**Tests**

- An owner can’t touch other restaurants; pending restaurants aren’t public; approval publishes the restaurant.

**Done when**

- [ ] An owner can sign up, get approved and edit their restaurant
- [ ] Photos upload to Cloudinary and appear on the details page

### Step 5 — Tables, opening hours and blocks

_Branch: feature/tables-hours-blocks · Week 3_

**Goal:** everything the availability check needs from the restaurant.

**Tasks**

- Tables (`DiningTable`): name, max capacity, minimum guests, active on/off. The database enforces 1 ≤ minimum ≤ capacity and unique names per restaurant.
- Opening hours editor: a weekly grid with several periods per day; a period may end after midnight (e.g. 18:00–02:00). The backend rejects overlapping periods.
- Blocks: block one table or the whole restaurant for a time range, with a reason and an “all day” shortcut — e.g. “Table 4, 12 Oct 18:00–23:00, private event” or “Closed 31 Dec”.

**Tests**

- Opening-hours validation (overlaps, overnight periods), table rules, block validation.

**Done when**

- [ ] An owner can manage tables, opening hours and blocks from the dashboard

### Step 6 — Availability and booking

_Branch: feature/reservations · Week 3_

**Goal:** the heart of the project — customers see free tables and book one.

**Tasks**

- Database: `Reservation` (restaurant, table, customer, source online/phone/walk-in, guest name and phone, guests, start, end, status, note, cancellation info) with check constraints and the double-booking constraint from Section 6.
  - The status is stored as text with a CHECK constraint instead of a PostgreSQL enum, so later migrations can’t break the double-booking constraint that uses it.
  - Tables with reservations can’t be deleted (foreign key `ON DELETE RESTRICT`) — owners switch them off instead.
- Availability service: the checks in Section 6, returning free tables with the best fit first.
- `GET /api/restaurants/:slug/availability?date&time&guests&duration` — the free tables, or the nearest free start times (±2 hours) when nothing is free.
- `POST /api/reservations` — in one transaction: check again, insert as PENDING. Every query inside the transaction goes through the transaction’s own manager (using the global connection there can freeze the connection pool under load).
- The error handler turns PostgreSQL’s “overlap” error (23P01) into 409 for every route that can hit it (booking, reschedule, owner bookings, status changes), with a code per constraint: `TABLE_TAKEN` or `CUSTOMER_OVERLAP`.
- Booking widget on the details page: date (calendar), time, guests, duration (default 2 hours) → free tables with the best one preselected → phone and special requests → confirm → success page.

**Tests**

- Availability unit tests (overnight hours, several periods, blocks, minimum guests, notice, booking window, slot alignment, back-to-back bookings) and API tests.

**Done when**

- [ ] A customer can choose date, time, guests and duration, see free tables and book one
- [ ] The new reservation is saved as PENDING

### Step 7 — Double-booking guarantee

_Branch: feature/double-booking · Week 4_

**Goal:** prove that two people can never get the same table at the same time.

**Tasks**

- Concurrency test: 10 different customers send booking requests for the same table and time at once → exactly 1 succeeds (201), 9 get 409, and the database holds 1 booking.
  - The 409 answer says which check stopped it (the normal check or the database constraint).
  - The test database uses a pool of 20 connections and a 5-second connection timeout, so a mistake fails quickly instead of hanging.
- Constraint proof test (always the same result): transaction A inserts a booking and waits; transaction B inserts an overlapping one and has to wait; A commits; B fails with 23P01. This shows the database itself refuses the second booking, even when the code’s checks passed.
- More tests: a partial overlap is rejected (19:00–21:00 vs 20:30–22:00); back-to-back is allowed (19:00–21:00 and 21:00–23:00); cancelled and no-show bookings free the table; one customer can’t hold two overlapping bookings.
- Bookings and new blocks wait for each other (row locks), with a test.
- Frontend: on `TABLE_TAKEN` show “this table was just booked” and reload the free tables; on `CUSTOMER_OVERLAP` show “you already have a booking at this time”.
- Write `docs/availability-and-double-booking.md` — your explanation script, with a diagram of two racing requests.

**Done when**

- [ ] The concurrency test passes in CI
- [ ] You can explain Section 6 in your own words

### Step 8 — Reservation management

_Branch: feature/reservation-management · Week 4_

**Goal:** both sides manage bookings after they are made.

**Tasks**

- All status rules in one place (a transitions table, see below), each one tested.
- Reschedule: change date, time, guests or duration; availability is checked again (ignoring the booking itself) and the booking goes back to PENDING.
- Customer — “My reservations”: Upcoming and Past tabs, cancel and reschedule buttons, the restaurant’s cancellation reason is shown.
- Restaurant — reservations day list: date picker, status filter; each row shows time, table, guests, name, phone, note and action buttons; past bookings still pending/confirmed are highlighted “needs attention”. Days are Yerevan days (`AT TIME ZONE 'Asia/Yerevan'`), because the database server runs in UTC.
- Restaurant — “Add phone / walk-in booking” dialog: keeps the opening-hours, block, capacity and double-booking checks, but skips the customer-only rules (minimum notice, booking window, slot alignment) — a walk-in is for right now.
- Nothing happens automatically: the restaurant marks arrived / no-show itself.

| Who | Action | Allowed when |
| --- | --- | --- |
| Customer | Cancel (PENDING or CONFIRMED → CANCELLED) | Until 2 hours before the start |
| Customer | Reschedule (→ PENDING) | Until 2 hours before the start |
| Restaurant | Confirm (PENDING → CONFIRMED) | Before the start |
| Restaurant | Cancel (→ CANCELLED, reason required) | Before the start |
| Restaurant | Arrived | From 30 minutes before the start |
| Restaurant | No-show (frees the table) | Only after the start time |
| Restaurant | Switch between Arrived and No-show (fix a mistake) | The same day |

**Tests**

- Every allowed and forbidden status change, the time limits, and that only the right restaurant can act.

**Done when**

- [ ] The full demo story works locally — the core project is complete

### Step 9 — Final features

_One pull request each, in this order · Weeks 5–6_

1. **Emails** (`feature/emails`): Resend. Booking received → customer and restaurant; confirmed or cancelled (with the reason) → customer; password reset. Sent after the database commit; a failed email is logged and never breaks a booking. Without your own domain Resend only delivers to your own address — adding a domain later is a settings change, not a code change.
2. **Reviews** (`feature/reviews`): only for reservations marked ARRIVED, one per visit, 1–5 stars and text; the restaurant’s rating is updated in the same transaction; reviews on the details page; minimum-rating filter and sort.
3. **Maps** (`feature/maps`): Google Maps JavaScript API via `@vis.gl/react-google-maps` — a marker on the details page and a map of the results next to the list. Its browser key is locked to your domain, which is safe because that key is public by design.
4. **Favorites** (`feature/favorites`): heart button on cards and on the details page, plus a “My favorites” page.
5. **Real restaurants from Google Places + claims** (`feature/places-import`): `npm run import:places` runs Google Places API (New) text search, one query per Yerevan district; saves by Google place ID so running it again updates instead of duplicating; fills in district, price level and opening hours. Imported restaurants have no owner and show “online booking not available”. “Register your restaurant” can now also claim an imported listing; claims are approved with `npm run claim:approve` until the admin panel exists.
6. **Admin panel** (`feature/admin`): approvals (new restaurants and claims) and management of all restaurants (search, edit, unpublish, publish again).
7. **Owner stats** (`feature/owner-stats`): reservations per day (chart), guests, no-show and cancellation rates, busiest hours — SQL GROUP BY queries in Yerevan time (`AT TIME ZONE 'Asia/Yerevan'`), drawn with Recharts.
8. **Stretch — availability search** (`feature/availability-search`): filter the restaurant list by date, time and guests, reusing the availability service.

> Google’s terms limit storing Places details (place IDs may be kept). Imported data is a starting draft that owners confirm and edit, and Google photos are not copied — imported restaurants show a placeholder until an owner uploads photos.

**Done when**

- [ ] Each feature is merged with its tests and a README update

### Step 10 — Deploy

_Branch: chore/deploy · First 1–2 days of the last week_

**Tasks**

- Neon: create the database; the backend connects with SSL (`DB_SSL=true`); migrations run automatically when the backend starts in production.
- Render: web service from the `backend` folder.
  - Build command `npm ci --include=dev && npm run build` — with `NODE_ENV=production`, a plain `npm ci` would skip the TypeScript compiler. Start command `npm start`, health check `/api/health`.
  - Environment variables: `NODE_ENV=production` (secure cookies, no error details in responses), `APP_URL`, `GOOGLE_REDIRECT_URI`, database settings, JWT secret, Google, Cloudinary, Resend and Places keys.
  - `trust proxy` set to the real number of proxies in front of the app (check once with a temporary debug endpoint) so rate limits see each user’s own IP address.
- Vercel: project from the `frontend` folder; `vercel.json` forwards `/api/:path*` to `https://<your-service>.onrender.com/api/:path*` — keep `/api` in the destination, because the backend serves its routes there — and sends every other path to `index.html`. This keeps login cookies working in every browser, including Safari. The Maps key is an environment variable.
- Google Cloud: add the production redirect URI `https://<your-app>.vercel.app/api/auth/google/callback`, lock the Maps key to your Vercel domain, and publish the OAuth consent screen “In production” — while it is in “Testing”, graders’ Google accounts are refused. The basic scopes (email, profile) need no Google review.
- Load data: run the seed and the import against Neon, then click through the whole demo story on the live site.

> Render’s free backend sleeps after 15 minutes without visitors and needs up to a minute to wake up — open the site a minute before a demo.

**Done when**

- [ ] The full demo story works on the live site

### Step 11 — Polish and defense prep

_Last days_

- README: endpoint table, how to run the project, architecture diagram, environment variables, screenshots.
- Check phone-size layouts, and the empty, loading and error states.
- Rehearse the demo and the double-booking explanation — run the concurrency test live.

## 5. Data model

| Entity | Main fields | Relationships |
| --- | --- | --- |
| User | email, passwordHash (empty for Google-only users), googleId, name, role | Owns 0–1 Restaurant; has many Reservations, Reviews, Favorites, tokens |
| RefreshToken | tokenHash, familyId, expiresAt, revokedAt | Belongs to a User |
| PasswordResetToken | tokenHash, expiresAt, usedAt | Belongs to a User |
| Restaurant | name, slug, address, district, lat/lng, priceLevel, status, googlePlaceId, booking settings, ratingAvg, ratingCount | Optional owner (User); has many photos, opening hours, tables, blocks, reservations, reviews, claims |
| RestaurantPhoto | url, publicId, position | Belongs to a Restaurant |
| RestaurantClaim | status (PENDING / APPROVED / REJECTED) | Links a User to the Restaurant they claim |
| OpeningHour | dayOfWeek, opensAt, closesAt | Belongs to a Restaurant |
| DiningTable | name, minCapacity, capacity, isActive | Belongs to a Restaurant; has many Reservations and Blocks |
| Block | startsAt, endsAt, reason | Belongs to a Restaurant; optional table (empty = whole restaurant) |
| Reservation | source, guestName, guestPhone, partySize, startsAt, endsAt, status (text + CHECK), note, cancelledBy, cancelReason | Belongs to a Restaurant and a DiningTable; optional customer (User); 0–1 Review |
| Review | rating (1–5), comment | One per Reservation; belongs to a User and a Restaurant |
| Favorite | userId + restaurantId (together the primary key) | Many-to-many between User and Restaurant |

All IDs are UUIDs. Times are stored in UTC (`timestamptz`) and converted from Yerevan time (Asia/Yerevan, UTC+4, no daylight saving).

## 6. How availability and double-booking prevention work

This is the part the graders will ask about most. Read it until you can say it in your own words.

### 6.1 Finding the free tables

The customer sends: restaurant, date, time, number of guests and duration. The backend then:

1. Turns the local date and time into a time range [start, end) in UTC.
2. Checks the restaurant’s rules: inside the booking window (30 days), enough notice (1 hour), start on a slot (every 30 minutes), allowed duration (1–4 hours).
3. Checks the restaurant is open for the whole range — one opening period must contain it, including yesterday’s period if it runs past midnight.
4. Checks there is no block for the whole restaurant in that range.
5. Takes the active tables where minimum guests ≤ guests ≤ capacity.
6. Removes tables that have a block in that range.
7. Removes tables that already have an active booking (PENDING, CONFIRMED or ARRIVED) overlapping the range.
8. Returns what is left, smallest suitable table first.

Two ranges overlap when `a.start < b.end` and `b.start < a.end`. Because the end is not included, 19:00–21:00 and 21:00–23:00 do not overlap, so back-to-back bookings are allowed.

### 6.2 Why checking is not enough

Two customers can look at Table 3 at the same moment. Both requests run the checks above, both see “free”, and both insert a booking. Checks in code alone can’t stop this — it is a race condition.

### 6.3 The guarantee: a PostgreSQL exclusion constraint

```
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE reservations ADD CONSTRAINT reservations_no_overlap
  EXCLUDE USING gist (
    "tableId" WITH =,
    tstzrange("startsAt", "endsAt", '[)') WITH &&
  )
  WHERE (status IN ('PENDING', 'CONFIRMED', 'ARRIVED'));
```

In plain words: among active bookings, PostgreSQL refuses to store two rows with the **same table** (`=`) whose **time ranges overlap** (`&&`). The database checks this itself when a row is inserted, so even if two inserts arrive in the same millisecond, only one can succeed. The other fails with error code 23P01, which our API turns into **409 Conflict** (“this table was just booked”), and the page reloads the free tables.

- `btree_gist` lets one GiST index compare the table ID with `=` and the time range with `&&`.
- In code the constraint is declared on the entity with TypeORM’s `@Exclusion(...)` and created by a migration. The status column is plain text with a CHECK constraint (not a PostgreSQL enum), so later migrations can’t break this rule.
- A second constraint does the same for (customer, time range), so one customer can’t hold two overlapping bookings.
- The normal checks still run first: they give friendly messages in everyday cases. The constraint is the safety net for the race.

### 6.4 The proof

An automated test sends 10 booking requests from 10 different customers for the same table and time at once. Exactly one gets 201 Created, nine get 409 Conflict, and the database contains exactly one booking. A second test makes the race happen on purpose: transaction A inserts a booking and waits, transaction B’s overlapping insert has to wait for A, and when A commits, B fails with 23P01 — the database itself refused it. Both tests run in CI on every pull request, and you can run them live during the defense.

### 6.5 Likely questions

| Question | Short answer |
| --- | --- |
| Why not just check before inserting? | Two requests can both pass the check before either inserts (a race condition). Only the database can decide atomically. |
| Why not a unique constraint on (table, start time)? | It only stops identical start times. 19:00–21:00 and 19:30–21:30 would both pass. Durations vary, so we need range overlap. |
| Does it work with several backend servers? | Yes. The rule lives in the database, not in the server’s memory, so every server is checked by the same database. |
| How do you know the database, not your code, stopped it? | The constraint-proof test: one transaction holds an uncommitted booking, a second overlapping insert waits, and after the first commits it fails with 23P01 — even though the code’s checks had passed. |
| Why does a PENDING booking hold the table? | So nobody else takes it while the restaurant decides. Cancelled and no-show bookings stop holding it. |
| What if an owner adds a block while someone is booking? | Booking and block creation lock the same rows, so one waits for the other and the second one sees the first. |
| Why store times in UTC? | One unambiguous moment per booking. Yerevan time is only used for input and display. |

## 7. Schedule

| Week | Steps | Milestone |
| --- | --- | --- |
| 1 | 1b Finish setup · 2 Authentication | Password and Google login work |
| 2 | 3 Restaurants (seed data) · 4 Owner sign-up and dashboard · start 5 | Browse restaurants; owners edit info and photos |
| 3 | Finish 5 Tables, hours, blocks · 6 Availability and booking | Customers can book a table |
| 4 | 7 Double-booking guarantee · 8 Reservation management | Core complete — the full story works locally |
| 5 | 9.1–9.5 Emails, reviews, maps, favorites, Google Places import + claims | Customer features and real restaurants |
| 6 | 10 Deploy (days 1–2) · 9.6–9.8 Admin, owner stats, stretch · 11 Polish | Live site and defense ready |

> Biggest schedule risk: the graded core (steps 6–7) can only start once steps 1b–5 are done, so keep weeks 1–2 lean. If the deadline turns out to be 4 weeks, the must-haves are steps 1b–8, reviews (9.2 — the project description lists “leave reviews” on the customer side) and the deploy. Drop the other Step 9 features from the end of the list.

## 8. Accounts and keys you will need

| When | Account / key | Notes |
| --- | --- | --- |
| Step 2 | Google Cloud project + OAuth client ID (Web application) | Redirect URI for development: http://localhost:5173/api/auth/google/callback |
| Step 4 | Cloudinary | Cloud name, API key and API secret (the secret only in backend/.env) |
| Step 9 | Resend API key; Maps JavaScript API browser key | Domain decision later |
| Step 9 | Places API (New) + a server API key | Needs a billing account; the free monthly usage covers this project. The key lives only in backend/.env |
| Step 10 | Neon, Render and Vercel (sign in with GitHub) | Connect the GitHub repository |

## 9. Getting started: commit the baseline

The project setup is not committed yet. Run these commands yourself. A dry run confirmed that `backend/.env` and `.idea/` stay out of Git.

```
cd ~/Projects/dine-yerevan
git add -A
git status
git commit -m "chore: TypeScript setup for backend and frontend" \
  -m "Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
git push origin main
```

Then start Step 1b on its own branch and tell Claude to begin:

```
git switch -c feature/ui-foundation
```

## 10. Sources checked while planning

- Resend free tier — without your own domain it delivers only to your own address; 3,000 emails/month, 100/day: [automationatlas.io](https://automationatlas.io/answers/resend-free-tier-explained-2026/)
- SendGrid free plan retired on 27 May 2025 (60-day trial, then paid): [twilio.com changelog](https://www.twilio.com/en-us/changelog/sendgrid-free-plan)
- Render free web services block outbound SMTP since 26 Sep 2025 (so emails go through an HTTPS API): [render.com changelog](https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports)
- Render free services sleep after 15 minutes idle and wake in up to a minute: [render.com/docs/free](https://render.com/docs/free)
- Supabase free projects pause after 7 days of inactivity: [supabase.com docs](https://supabase.com/docs/guides/platform/free-project-pausing)
- Neon free plan — 0.5 GB, scale to zero, no inactivity pausing: [costbench.com](https://costbench.com/software/database-as-service/neon/free-plan)
- Railway — $5 one-time trial, Hobby plan $5/month: [docs.railway.com](https://docs.railway.com/reference/pricing)
- TypeORM 1.1.1 (installed in the project) — has `@Exclusion`, `@Check`, the `tstzrange` column type and `migrationsRun`, and installs `btree_gist` automatically when an entity has an exclusion constraint.
