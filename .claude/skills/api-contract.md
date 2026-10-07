# Rule: API contract (backend ↔ frontend)

Applies to every task that adds, changes or calls an endpoint.

## URLs
- Every route is under `/api`. The frontend calls `/api/...` from the same origin: through the Vite proxy in development and Vercel rewrites in production. That way the cookies just work.
- **Public:** `/api/restaurants`, `/api/restaurants/:slug`, `/api/restaurants/:slug/availability`.
- **Logged-in user:** `/api/auth/*`, `/api/me/*`, `/api/reservations*`.
- **Owner:** `/api/owner/restaurant/*`. "My restaurant" always comes from the logged-in user, never from an id in the URL.
- **Admin:** `/api/admin/*`.
- Paths use plural nouns in kebab-case, with ids in the path. Actions that aren't plain updates get their own path, e.g. `POST /api/reservations/:id/cancel`.

## Requests and responses
- JSON with camelCase fields. Ids are UUID strings.
- Moments are ISO 8601 UTC strings (`2026-10-12T15:00:00.000Z`). Local Yerevan inputs are separate fields: `date=YYYY-MM-DD` and `time=HH:mm`.
- Status codes:

  | Code | Use |
  | --- | --- |
  | `200` | read, update |
  | `201` | created; return the new resource |
  | `204` | success with no body |
  | `400` | invalid input |
  | `401` | not logged in |
  | `403` | wrong role |
  | `404` | not found, **or not yours** |
  | `409` | conflict: duplicate, double booking, or a rule broken by the current state |
  | `429` | too many requests |

- Errors always look like `{ "error": { "message": string, "code"?: string, "details"?: unknown } }`.
  - Validation (400): `details = { location: "body" | "query" | "params", fieldErrors: { field: [message] }, formErrors: [message] }`.
  - `code` is set only for errors the frontend reacts to. The codes are listed in `domain.md`.
  - A 5xx answer never shows internals. Its message is "Internal Server Error".
- Lists are paged with the query params `page` and `limit` (limit ≤ 50). The response shape is decided in Step 3; write it here once chosen.

## Login state
- The login state lives only in httpOnly cookies:
  - `access_token`: 15 minutes, path `/api`.
  - `refresh_token`: 30 days, path `/api/auth`.
- The frontend never reads or stores tokens.
- On a 401, the frontend calls `POST /api/auth/refresh` once, then retries the original request once.

## Where the contract lives
- **It is written first**, in the frontend part of a step:
  - the types and functions in `frontend/src/features/<feature>/<feature>.api.ts`;
  - the fake answers in `frontend/src/test/msw/handlers.ts`. The tests and mock mode (`npm run dev:mock`) both use them.
- **The backend implements exactly that JSON:** the same fields, types, status codes and error codes.
- **If something has to change**, update the types and the fake answers first, in the same commit as the backend change.
- **Steps without screens** have no frontend part. There, the backend design (shown to the user before building) is the contract.

## Documentation
Every new or changed endpoint gets a row in the README "API endpoints" table in the same pull request, once the real endpoint exists: `| Method | Path | Who | What it does |`.
