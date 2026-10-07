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

1. Add an entity next to its feature as `src/modules/<feature>/<name>.entity.ts`. Every `*.entity.ts` under `src/modules` is loaded automatically.
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

```
backend/
├── src/
│   ├── server.ts          # entry point: connects the database, starts HTTP, graceful shutdown
│   ├── app.ts             # Express app: middleware → /api routes → 404 → error handler
│   ├── routes.ts          # mounts every module's router under /api
│   ├── config/env.ts      # the only place that reads process.env
│   ├── db/
│   │   ├── data-source.ts # TypeORM config, shared by the app and the CLI
│   │   └── migrations/    # generated migrations
│   ├── middlewares/       # 404, error handler, validate (Zod)
│   ├── modules/           # one folder per feature: routes, controller, service, entities
│   │   └── health/
│   └── utils/             # HttpError
└── tests/                 # API tests; helpers/db.ts sets up and empties the test database
```

To add a feature, create `src/modules/<feature>/` with `<feature>.routes.ts`, `<feature>.controller.ts`, `<feature>.service.ts` and its entities, then mount the router in `src/routes.ts`. Express 5 sends thrown errors and rejected promises to the error handler, so handlers need no try/catch.

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
│   ├── query-client.ts   # TanStack Query cache settings
│   └── utils.ts          # cn(): merges Tailwind class names
└── test/
    ├── setup.ts          # Vitest + Testing Library + MSW setup
    ├── render.tsx        # renderRoute(path): renders a page with the app's providers
    └── msw/              # fake API responses for tests (handlers.ts)
```

- **Pages:** to add a page, create it in `src/pages/` and add it to `src/routes.tsx`. Put a feature's API calls (via `api` from `lib/api-client.ts`) and components in `src/features/<feature>/`.
- **Styling:** use Tailwind classes. Colors come from the CSS variables in `index.css` (`bg-primary`, `text-muted-foreground`, …). Imports from `src/` can use the `@/` alias, e.g. `@/components/ui/button`.
- **Server data:** load it with TanStack Query's `useQuery` and change it with `useMutation`, both wrapping functions from the feature's `*.api.ts`.
- **Tests:** MSW answers API calls in tests with the handlers in `src/test/msw/handlers.ts`. A single test can override one with `server.use(...)`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every pull request and every push to `main`:

- **backend:** lint, typecheck and tests, against a temporary PostgreSQL service.
- **frontend:** lint, typecheck, tests and build.

Merge a pull request only when both jobs are green.
