# Dine Yerevan

| App         | Stack                                                                |
| ----------- | -------------------------------------------------------------------- |
| `backend/`  | Node.js 24, Express 5, TypeScript, TypeORM 1, PostgreSQL 18 (Docker) |
| `frontend/` | React 19, React Router 8, Vite 8, TypeScript                         |

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

| Host           | Database       | User   | Password |
| -------------- | -------------- | ------ | -------- |
| localhost:5432 | `dine_yerevan` | `dine` | `dine`   |

The backend reads these values from `backend/.env` as `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` and `DB_NAME`.

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

## Backend

| Command                             | What it does                                                            |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `npm run dev`                       | Start with auto-restart on file changes, loading `.env`                 |
| `npm run build` / `npm start`       | Compile to `dist/` / run the compiled server (env from the environment) |
| `npm test`                          | API tests (`node:test` + Supertest)                                     |
| `npm run typecheck`                 | Type-check with `tsc`                                                   |
| `npm run lint` / `npm run format`   | ESLint / Prettier (`lint:fix`, `format:check`)                          |
| `npm run db:up` / `npm run db:down` | Start / stop the Docker database                                        |
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
│   ├── middlewares/       # 404 and error handler
│   ├── modules/           # one folder per feature: routes, controller, service, entities
│   │   └── health/
│   └── utils/             # HttpError
└── tests/                 # API tests
```

To add a feature, create `src/modules/<feature>/` with `<feature>.routes.ts`, `<feature>.controller.ts`, `<feature>.service.ts` and its entities, then mount the router in `src/routes.ts`. For expected errors, `throw new HttpError(status, message)`. Express 5 sends thrown errors and rejected promises to the error handler, so handlers need no try/catch.

TypeORM's decorators need TypeScript's decorator metadata, which Node's built-in TypeScript support and esbuild-based runners can't emit. That's why `.ts` files run through SWC (`@swc-node/register`) in dev, tests and the TypeORM CLI, and `npm run build` uses `tsc`. TypeScript stays on 6.0 until typescript-eslint and the SWC runner support 7.

## Frontend

| Command                             | What it does                                             |
| ----------------------------------- | -------------------------------------------------------- |
| `npm run dev`                       | Dev server on http://localhost:5173                      |
| `npm run build` / `npm run preview` | Type-check and build into `dist/` / serve the built app  |
| `npm test`                          | Component tests (Vitest + Testing Library; `test:watch`) |
| `npm run typecheck`                 | Type-check with `tsc`                                    |
| `npm run lint` / `npm run format`   | ESLint / Prettier (`lint:fix`, `format:check`)           |

```
frontend/src/
├── main.tsx            # entry point: mounts <App />
├── App.tsx             # router and app-wide providers
├── routes.tsx          # every route; pages render inside RootLayout
├── index.css           # global styles and CSS variables
├── components/         # shared UI (CSS Modules: *.module.css)
├── pages/              # one component per route
├── features/           # one folder per feature: API calls and feature components
│   └── health/
├── lib/api-client.ts   # fetch wrapper for the backend API
└── test/setup.ts       # Vitest + Testing Library setup
```

To add a page, create it in `src/pages/` and add it to `src/routes.tsx`. Put a feature's API calls (via `api` from `lib/api-client.ts`) and components in `src/features/<feature>/`.
