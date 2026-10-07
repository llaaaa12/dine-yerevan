# Dine Yerevan

[![CI](https://github.com/llaaaa12/dine-yerevan/actions/workflows/ci.yml/badge.svg)](https://github.com/llaaaa12/dine-yerevan/actions/workflows/ci.yml)

| App         | Stack                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| `backend/`  | Node.js 24, Express 5, TypeScript, TypeORM 1, Zod, PostgreSQL 18 (Docker)                                              |
| `frontend/` | React 19, React Router 8, Vite 8, TypeScript, Tailwind CSS 4, shadcn/ui (Radix), TanStack Query, React Hook Form + Zod |

Editor and formatting settings (`.editorconfig`, `.prettierrc.json`) live at the repo root and are shared by both apps.

## Run locally

Requires Node.js 24.11+ and Docker. Nothing needs to be installed globally.

```bash
docker compose up -d        # PostgreSQL on localhost:5432

cd backend
npm install
cp .env.example .env
npm run migration:run       # apply database migrations
npm run dev                 # API on http://localhost:3000

# second terminal
cd frontend
npm install
npm run dev                 # app on http://localhost:5173
```

In development the frontend calls the API through Vite's proxy (`/api` → `localhost:3000`), so there are no CORS issues.

## Database

| Host           | Database            | Used by              | User   | Password |
| -------------- | ------------------- | -------------------- | ------ | -------- |
| localhost:5432 | `dine_yerevan`      | `npm run dev`        | `dine` | `dine`   |
| localhost:5432 | `dine_yerevan_test` | `npm test` (backend) | `dine` | `dine`   |

The backend reads these values from `backend/.env` as `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` and `DB_SSL`. `npm test` always uses `dine_yerevan_test`, and the test helpers refuse to run against any database whose name doesn't end in `_test`.

- The test database is created automatically when the Docker volume is new (`docker/initdb/`). If your volume existed before, create it once: `cd backend && npm run db:test:create`.
- SQL shell: `docker compose exec db psql -U dine -d dine_yerevan`
- `docker compose down` stops it and keeps the data; `docker compose down -v` also deletes the data.

### Entities and migrations (run in `backend/`)

1. Add an entity as `src/entities/<name>.entity.ts`, e.g. `restaurant.entity.ts`. Every `*.entity.ts` in that folder is loaded automatically.
2. Generate a migration from your entity changes, then review the SQL it wrote:
   `npm run migration:generate -- src/db/migrations/CreateRestaurants`
3. Apply it with `npm run migration:run`. `migration:revert` undoes the last one, `migration:show` lists them all.

The schema only changes through migrations (`synchronize` is off). Because the backend uses ES modules, wrap relation types in `Relation<>` to avoid circular-import errors:

```ts
@ManyToOne(() => Restaurant, (restaurant) => restaurant.reviews)
restaurant!: Relation<Restaurant>;
```

## API endpoints

All routes are under `/api`. Errors always look like `{ "error": { "message": "…", "code"?: "…", "details"?: … } }`.

| Method | Path          | Who    | What it does                                      |
| ------ | ------------- | ------ | ------------------------------------------------- |
| GET    | `/api/health` | Anyone | API status, uptime and whether the database is up |

## Backend

| Command                             | What it does                                                            |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `npm run dev`                       | Start with auto-restart on file changes, loading `.env`                 |
| `npm run build` / `npm start`       | Compile to `dist/` / run the compiled server (env from the environment) |
| `npm test`                          | API tests (`node:test` + Supertest) against `dine_yerevan_test`         |
| `npm run typecheck`                 | Type-check with `tsc`                                                   |
| `npm run lint` / `npm run format`   | ESLint / Prettier (`lint:fix`, `format:check`)                          |
| `npm run db:up` / `npm run db:down` | Start / stop the Docker database                                        |
| `npm run db:test:create`            | Create the test database once (only for a volume that predates it)      |
| `npm run migration:<command>`       | `generate`, `create`, `run`, `revert`, `show` (see Database)            |

### Layered architecture

The backend is organized by layer. A request travels down the layers and the response comes back up:

```
route → controller → service → repository → database
```

```
backend/
├── src/
│   ├── server.ts          # entry point: connects the database, starts HTTP, graceful shutdown
│   ├── app.ts             # Express app: middleware → /api routes → 404 → error handler
│   ├── config/env.ts      # the only place that reads process.env
│   ├── db/
│   │   ├── data-source.ts # TypeORM config, shared by the app and the CLI
│   │   └── migrations/    # generated migrations
│   ├── routes/            # 1. URL + method → middlewares → controller; index.ts mounts all under /api
│   ├── controllers/       # 2. read the request, call a service, send the response
│   ├── services/          # 3. business rules (availability, booking, auth…); no req/res, no SQL
│   ├── repositories/      # 4. every database query; the only layer that touches the database
│   ├── entities/          #    TypeORM classes, one per table (from Step 2)
│   ├── validators/        #    Zod rules for request data, used in routes (from Step 2)
│   ├── integrations/      #    clients for outside APIs: Google, Cloudinary, Resend (from Step 2)
│   ├── middlewares/       # 404, error handler, validate (Zod); auth checks from Step 2
│   └── utils/             # small shared helpers (HttpError)
└── tests/                 # API tests; helpers/db.ts sets up and empties the test database
```

Files are named `<feature>.<layer>.ts`. The health check is the smallest example: `routes/health.routes.ts` → `controllers/health.controller.ts` → `services/health.service.ts` → `repositories/health.repository.ts`.

**Rules between layers:**

- A layer only calls the layer directly below it. Controllers never query the database, services never see `req`/`res`, and repositories contain no business rules.
- Services reach outside APIs through `integrations/`, the same way they reach the database through `repositories/`.
- Repository functions take an optional TypeORM `manager`, so a service can run several of them in one transaction. The double-booking protection relies on this:

  ```ts
  await dataSource.transaction(async (manager) => {
    await lockTable(manager, tableId);
    await insertReservation(manager, reservation);
  });
  ```

**To add a feature** (e.g. restaurants):

1. `entities/restaurant.entity.ts` and a migration (see Database).
2. `repositories/restaurant.repository.ts`: the queries.
3. `services/restaurant.service.ts`: the business rules, using the repository.
4. `validators/restaurant.validators.ts`: Zod schemas for the request data.
5. `controllers/restaurant.controller.ts`: reads `res.locals`, calls the service and sends the JSON.
6. `routes/restaurant.routes.ts`: the URLs with `validate(...)` and the controller. Then mount it in `routes/index.ts`.

Express 5 sends thrown errors and rejected promises to the error handler, so no layer needs try/catch just to forward errors.

- **Validate input** with `validate({ body, query, params })` from `src/middlewares/validate.ts`, passing Zod schemas. Handlers read the parsed values from `res.locals.body`, `res.locals.query` and `res.locals.params` (Express 5 makes `req.query` read-only). Invalid input gets a 400 with `details: { location, fieldErrors, formErrors }`.
- **Expected errors:** `throw new HttpError(status, message, { code, details })`. `code` is a stable name the frontend can react to, e.g. `TABLE_TAKEN`.

TypeORM's decorators need TypeScript's decorator metadata, which Node's built-in TypeScript support and esbuild-based runners can't emit. That's why `.ts` files run through SWC (`@swc-node/register`) in dev, tests and the TypeORM CLI, and `npm run build` uses `tsc`. TypeScript stays on 6.0 until typescript-eslint and the SWC runner support 7.

## Frontend

| Command                             | What it does                                             |
| ----------------------------------- | -------------------------------------------------------- |
| `npm run dev`                       | Dev server on http://localhost:5173                      |
| `npm run build` / `npm run preview` | Type-check and build into `dist/` / serve the built app  |
| `npm test`                          | Component tests (Vitest + Testing Library; `test:watch`) |
| `npm run typecheck`                 | Type-check with `tsc`                                    |
| `npm run lint` / `npm run format`   | ESLint / Prettier (`lint:fix`, `format:check`)           |
| `npx shadcn@latest add <name>`      | Add a shadcn/ui component to `src/components/ui/`        |

```
frontend/src/
├── main.tsx              # entry point: mounts <App />
├── App.tsx               # app-wide providers (TanStack Query) around the router
├── routes.tsx            # every route; pages render inside RootLayout
├── index.css             # Tailwind entry: brand colors (red + warm stone grays), font, base styles
├── styles/shadcn.css     # shadcn/ui's Tailwind helpers (copied by `shadcn eject`)
├── components/           # shared components
│   └── ui/               # shadcn/ui components: our own copies, edit freely
├── pages/                # one component per route
├── features/             # one folder per feature: API calls and feature components
│   └── health/
├── lib/
│   ├── api-client.ts     # fetch wrapper for the backend API (throws ApiError with status/code)
│   ├── query-client.ts   # TanStack Query cache settings (retries only network/5xx errors)
│   └── utils.ts          # cn(): merges Tailwind class names
└── test/                 # every frontend test lives here
    ├── *.test.ts(x)      # the tests, e.g. routes.test.tsx, api-client.test.ts
    ├── setup.ts          # Vitest + Testing Library + MSW setup
    ├── render.tsx        # renderRoute(path) / renderWithProviders(ui)
    └── msw/              # fake API responses for tests (handlers.ts)
```

- **Pages:** to add a page, create it in `src/pages/` and add it to `src/routes.tsx`. Put a feature's API calls (via `api` from `lib/api-client.ts`) and components in `src/features/<feature>/`.
- **Styling:** use Tailwind classes. Colors come from the CSS variables in `index.css` (`bg-primary`, `text-muted-foreground`, …). Imports from `src/` can use the `@/` alias, e.g. `@/components/ui/button`.
- **Server data:** load it with TanStack Query's `useQuery` and change it with `useMutation`, both wrapping functions from the feature's `*.api.ts`.
- **Tests:** all test files live in `src/test/` as `<name>.test.ts(x)`. Vitest only runs `src/test/**/*.test.{ts,tsx}`, so a test placed anywhere else won't run. When there are many, group them in subfolders that mirror `src/`, e.g. `src/test/features/booking/`.
  - Render a whole page with `renderRoute('/path')`, or a single component with `renderWithProviders(<Component />)`.
  - MSW answers API calls with the handlers in `src/test/msw/handlers.ts`. A single test can override one with `server.use(...)`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every pull request and every push to `main`:

- **backend:** lint, typecheck and tests, against a temporary PostgreSQL service.
- **frontend:** lint, typecheck, tests and build.

Merge a pull request only when both jobs are green.
