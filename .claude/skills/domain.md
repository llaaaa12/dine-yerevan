# Rule: domain (shared by backend and frontend)

Applies to every task. Source: `docs/roadmap.md` sections 3, 5, 6 and 8.

## Roles and statuses
All of these are stored as text + CHECK, never as Postgres enums.
- **User role:**
  - `CUSTOMER` (the default).
  - `OWNER`: owns 0–1 restaurant.
  - `ADMIN`.
- **Restaurant status:**
  - `PENDING` → `PUBLISHED` (approved) or `REJECTED`.
  - `UNPUBLISHED`: hidden by an admin.
  - Only `PUBLISHED` restaurants are public.
- **Reservation status:** `PENDING` (new, and already holds the table), `CONFIRMED`, `ARRIVED`, `NO_SHOW`, `CANCELLED`.
  - **Active** (holds the table) means `PENDING`, `CONFIRMED` or `ARRIVED`. `CANCELLED` and `NO_SHOW` free the table.
- **Reservation source:** `ONLINE`, `PHONE`, `WALK_IN`.
- **`cancelledBy`:** `CUSTOMER` or `RESTAURANT`.
- **Claim status** (Step 9): `PENDING`, `APPROVED`, `REJECTED`.

## Time
- **Storage:** every moment is stored as UTC `timestamptz`.
- **Yerevan time** (`Asia/Yerevan`, UTC+4, no daylight saving) is used only at the edges: API input (`date`, `time`) and display.
- **Ranges are half-open** `[start, end)`. Two ranges overlap when `a.start < b.end && b.start < a.end`. So 19:00–21:00 and 21:00–23:00 don't overlap, and back-to-back bookings are allowed.
- **Opening hours:**
  - There can be several periods per day. `dayOfWeek` runs 1–7 (Monday–Sunday).
  - A period with `closesAt <= opensAt` ends the next day, e.g. 18:00–02:00.
  - Sunday's late period continues into Monday.
- **"A day"** in the dashboard and in stats means a Yerevan day (`AT TIME ZONE 'Asia/Yerevan'`), because the database runs in UTC.

## Booking rules (per restaurant; defaults)
- Slot step 30 min.
- Default duration 120 min; allowed 60–240 min.
- Bookings up to 30 days ahead, with at least 60 min notice.
- A customer can cancel or reschedule until 120 min before the start.

Phone and walk-in bookings made by the restaurant skip the customer-only rules (notice, window, slot alignment). They still need opening hours, no blocks, enough capacity and the double-booking constraint.

## Availability (roadmap 6.1)
A free table:
- is active, with `minCapacity ≤ guests ≤ capacity`;
- belongs to a restaurant that is open for the whole range;
- has no restaurant block, no table block and no overlapping active reservation.

Return the smallest suitable table first. When nothing is free, suggest start times within ±2 hours, in slot steps.

## Double booking: the database is the guarantee
- Two exclusion constraints cover active reservations: `reservations_no_overlap` (same table) and `reservations_customer_no_overlap` (same customer).
  - Never drop, weaken or bypass them.
  - Never turn status into a Postgres enum.
- The checks in code only run first, to give friendly messages. The constraint is what stops races.
- A violation (`23P01`) becomes **409** with code `TABLE_TAKEN` or `CUSTOMER_OVERLAP`. From Step 7, `details.detectedBy` says which check stopped it: `availability-check` or `database-constraint`.
- Bookings and blocks lock the same rows (restaurant, table), so they wait for each other.

## Status changes (one transitions table in code: `services/reservation-status.rules.ts`)

| Who | Change | Allowed when |
| --- | --- | --- |
| Customer | PENDING / CONFIRMED → CANCELLED | until `cancelCutoffMinutes` before the start |
| Customer | reschedule (→ PENDING) | until `cancelCutoffMinutes` before the start |
| Restaurant | PENDING → CONFIRMED | before the start |
| Restaurant | PENDING / CONFIRMED → CANCELLED (reason required) | before the start |
| Restaurant | → ARRIVED | from 30 min before the start |
| Restaurant | → NO_SHOW | only after the start |
| Restaurant | ARRIVED ↔ NO_SHOW (fix a mistake) | the same Yerevan day |

Nothing changes automatically.

## Error codes (stable names the frontend reacts to)

| Code | HTTP | Meaning |
| --- | --- | --- |
| `TABLE_TAKEN` | 409 | someone else got this table for that time |
| `CUSTOMER_OVERLAP` | 409 | this customer already has a booking at that time |

Add every new code to this table when it is introduced.

## Reviews (Step 9)
- Only the reservation's own customer can review, only when the reservation is `ARRIVED`, and only once per reservation.
- Rating is 1–5.
- The restaurant's `ratingAvg` and `ratingCount` are updated in the same transaction.
