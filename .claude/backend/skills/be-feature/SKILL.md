---
name: be-feature
description: "Build a Dine Yerevan backend feature or endpoint through every layer in order: entity and migration, repository, pure rules, service, Zod validators, controller, route, tests, README row and seed data. Use for any new API resource or endpoint in backend/ (e.g. 'add the restaurants API', 'add POST /api/reservations')."
argument-hint: "[feature or endpoint, e.g. restaurants or 'POST /api/reservations']"
---

# Build a backend feature

Feature: $ARGUMENTS

Follow `.claude/backend/rules/` (architecture, database, testing) and the shared rules `domain.md`, `api-contract.md` and `security.md`. If the feature is in `docs/tasks.md`, use its task IDs, file names and endpoints.

1. **Start from the contract.** In the frontend-first order, the frontend part already defined it.
   - Read `frontend/src/features/<feature>/<feature>.api.ts` (request and response types) and the matching handlers in `frontend/src/test/msw/handlers.ts` (fake answers, status codes, error codes).
   - The backend must send exactly that JSON. If something has to differ, change the contract first, and tell the user why.
   - Steps without screens have no frontend contract. There, design the endpoints (method, path, who may call them, status codes, error codes, JSON) and show them to the user first.
   - Then show the entity fields and constraints the contract needs. Ask about anything the roadmap leaves open.
2. **Database first:** `src/entities/<entity>.entity.ts`, then its **migration** (follow `/be-migration`). In `docs/tasks.md` these are group 3; the rest of this recipe is group 4.
3. **Repository:** `src/repositories/<entity>.repository.ts`.
   - One function per query, with `manager: EntityManager = dataSource.manager` as the last parameter.
   - Returns entities or raw rows.
4. **Pure rules:** `src/services/<feature>.rules.ts`, when there is logic that doesn't need the database (time maths, combinations, transitions). It takes `now` as a parameter.
5. **Service:** `src/services/<feature>.service.ts`.
   - Checks ownership and the rules.
   - Runs transactions with `dataSource.transaction(async (manager) => …)`, passing `manager` to every repository call.
   - Throws `HttpError` with a `code` when the frontend must react.
   - Returns DTOs.
6. **Validators:** `src/validators/<feature>.validators.ts`, with Zod schemas for body, query and params: `z.coerce` for numbers in the query, `.trim()`, max lengths, `z.enum([...])` for statuses.
7. **Controller:** `src/controllers/<feature>.controller.ts`.
   - Reads `res.locals.*` and `req.user`, and calls one service function.
   - Answers with `res.status(201).json(...)`, `res.status(204).end()` or `res.json(...)`.
8. **Routes:** `src/routes/<feature>.routes.ts`, with `validate(...)`, the auth middlewares and the controller. Mount the router in `src/routes/index.ts`.
9. **Tests:** `tests/<feature>.test.ts` (follow `/be-test`).
   - API tests: happy path, 400, 401, 403, 404 (not yours), 409.
   - Unit tests for `*.rules.ts`.
10. **Docs and data:**
    - README "API endpoints" rows.
    - New env vars in `.env.example` and the README.
    - Demo data in `src/cli/seed.ts` if the demo needs it.
11. **Check:**
    - In `backend/`, run `npm run lint && npm run typecheck && npm test`.
    - Compare a real response with the MSW fake answer: the same fields and types.
    - Then tell the user how to try it: a `curl` command, or the frontend page with `npm run dev` (not mock mode).

Pattern to copy: the health feature is the smallest complete example, `routes/health.routes.ts` → `controllers/health.controller.ts` → `services/health.service.ts` → `repositories/health.repository.ts`.
