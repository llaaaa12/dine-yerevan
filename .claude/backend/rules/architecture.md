# Backend rule: architecture

Applies to every task in `backend/`.

## Layers
A request goes down the layers, and the answer comes back up:
`routes/` → `controllers/` → `services/` → `repositories/` → database (`entities/`)

| Folder | Does | Never |
| --- | --- | --- |
| `routes/<feature>.routes.ts` | URL + method → middlewares (`validate`, `requireAuth`, …) → controller; mounted in `routes/index.ts` | contain logic |
| `controllers/<feature>.controller.ts` | read `res.locals.body/query/params` and `req.user`, call one service function, choose the status code, send JSON | query the database or hold business rules |
| `services/<feature>.service.ts` | business rules, ownership checks, transactions, DTOs; throws `HttpError` | see `req`/`res` or write SQL |
| `services/<feature>.rules.ts` | pure functions (no database, no clock: `now` is passed in), easy to unit-test | import repositories |
| `repositories/<entity>.repository.ts` | every database query; each function takes an optional `manager` | hold business rules |
| `entities/<entity>.entity.ts` | TypeORM classes, one per table | |
| `validators/<feature>.validators.ts` | Zod schemas for body, query and params | |
| `integrations/<service>.ts` | outside APIs: Google, Cloudinary, Resend | |
| `middlewares/` | error handler, 404, `validate`, auth | |
| `utils/` | small shared helpers: `HttpError`, Yerevan time, … | |
| `cli/` | scripts run with `npm run <name>` | |

- A layer only calls the layer directly below it.
- Services reach outside APIs through `integrations/`, the same way they reach the database through `repositories/`.

## Code style
- **Files:** named `<feature>.<layer>.ts`. Export named functions (no classes) for controllers, services and repositories. Routers are `export const <feature>Router = Router()`.
- **Imports:** this is an ES module project, so relative imports end in `.js` (`import { env } from '../config/env.js'`).
  - Prefer `import type` for type-only imports.
  - Keep `verbatimModuleSyntax` off, because TypeORM migrations import types without it.
- **Running `.ts`:** SWC (`@swc-node/register`) runs the `.ts` files in dev, in tests and in the TypeORM CLI, because decorators need metadata. `npm run build` uses `tsc`. Never switch to tsx, esbuild or Node's type stripping.
- **Config:** read it only from `env` (`src/config/env.ts`).
- **No try/catch for forwarding:** Express 5 sends thrown errors and rejected promises to the error handler, so no try/catch is needed just to call `next(err)`.

## Input, errors and output
- Every route that takes input uses `validate({ body, query, params })` with schemas from `validators/`. Handlers read the parsed values from `res.locals`.
- Expected errors: `throw new HttpError(status, message, { code?, details? })`.
- Unexpected errors bubble up to `middlewares/error-handler.ts`. It is the only place that turns errors into responses, including Postgres error codes.
- Services return DTOs: plain objects shaped for the API. Never return entities with `passwordHash`, token hashes or another user's private data.

## Adding a feature
Start from the contract that the frontend part of the step wrote: the `<feature>.api.ts` types and the MSW handlers (see `api-contract.md`). Then work in this order:
1. entity + migration
2. repository
3. `*.rules.ts` (if there is pure logic)
4. service
5. validators
6. controller
7. routes, mounted in `routes/index.ts`
8. tests
9. README endpoint rows
10. seed data, if the demo needs it

The `/be-feature` skill walks through it. The health feature is the smallest example: `routes/health.routes.ts` → `controllers/health.controller.ts` → `services/health.service.ts` → `repositories/health.repository.ts`.
