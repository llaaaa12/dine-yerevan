# Dine Yerevan

Restaurant discovery and table reservations for Yerevan. It is a final project, built step by step. The graders focus most on **how availability is calculated and how double booking is prevented** (`docs/roadmap.md`, section 6).

- `backend/`: Node.js 24, Express 5, TypeScript 6.0, TypeORM 1.1, Zod, PostgreSQL 18 in Docker.
- `frontend/`: React 19, Vite 8, React Router 8, TypeScript 6.0, Tailwind CSS 4, shadcn/ui, TanStack Query, React Hook Form + Zod.
- `docs/roadmap.md`: the plan. Steps 1b–11, each one is one branch and one pull request.
- `docs/tasks.md`: the task checklist, with IDs such as `6.9`.

## Rules and skills: always follow them

Everything Claude must follow lives in `.claude/`. **A `.md` file is a rule. A folder with a `SKILL.md` inside is a skill.**

| Folder | Holds | Used for |
| --- | --- | --- |
| `.claude/skills/` | whole-project rules (`*.md`) and skills (folders) | every task |
| `.claude/backend/rules/`, `.claude/backend/skills/` | backend rules and skills | backend tasks |
| `.claude/frontend/rules/`, `.claude/frontend/skills/` | frontend rules and skills | frontend tasks |

Before starting a task, read the rule files that apply, and follow them for the whole task:
- **Backend task** (work in `backend/`): the rules and skills in `.claude/skills/` and `.claude/backend/`.
- **Frontend task** (work in `frontend/`): the rules and skills in `.claude/skills/` and `.claude/frontend/`.
- **Task that touches both apps:** all three folders.

Rules always apply. A skill applies when the task matches it; then follow its steps. If a request conflicts with a rule, say so and ask before breaking the rule.

**Order inside a step.** `docs/tasks.md` groups every step's tasks in this order:
1. frontend design
2. frontend API with fake answers (this is the API contract)
3. database
4. backend
5. shared

Parts 1–2 are frontend tasks. Parts 3–4 are backend tasks. Part 5 touches both apps. Details are in `.claude/skills/workflow.md`.

### Skills: type `/name`, or just ask in words

| Whole project | Backend | Frontend |
| --- | --- | --- |
| `/start-step` · `/finish-step` · `/review-step` | `/be-feature` · `/be-migration` | `/fe-page` · `/fe-form` |
| `/explain` · `/defense-drill` | `/be-test` · `/be-cli` | `/fe-test` · `/ui-check` |
| `/env-check` · `/db-inspect` · `/add-rule` · `/add-skill` | `/be-integration` | |

Claude Code only finds skills inside `.claude/skills/`. So each backend and frontend skill has a shortcut (symlink) there that points to its real folder.
- Edit the real files.
- Create new skills with `/add-skill`, which also adds the shortcut.
- Claude Code's own `/code-review` (bug hunting) is still available next to `/review-step`.

## Commands

| | `backend/` | `frontend/` |
| --- | --- | --- |
| Run | `npm run dev` → http://localhost:3000 | `npm run dev` → http://localhost:5173 |
| Run without the backend | | `npm run dev:mock`: same app, API answered by the fake MSW handlers |
| Checks (same as CI) | `npm run lint` · `npm run typecheck` · `npm test` | `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` |
| Database | `npm run migration:run` · `npm run seed` (from Step 3) | |

The database runs in Docker: run `docker compose up -d` from the repo root. Backend tests need it, because they use the `dine_yerevan_test` database.

## Definition of done (every pull request)

- Lint, typecheck and tests pass locally and in CI, and so does the frontend build.
- New behavior has tests, including the error cases.
- The README endpoint table lists every new or changed endpoint.
- Finished tasks are ticked in `docs/tasks.md`.
- No secrets, debug code or stray `console.log`.

## Automation (`.claude/settings.json`, `.claude/hooks/`)

- **Guardrails:**
  - Blocked: git commands that change the repo, `.env` files, and committed migrations.
  - Need the user's OK: deleting Docker data, reverting migrations and installing packages.
- **Format and lint:** every file Claude edits in `backend/` or `frontend/` is formatted with Prettier and linted with ESLint. Use the Edit/Write tools for source files, not `sed` or heredocs, so this runs.
- **Session briefing:** each session starts with a short briefing: branch → step, open tasks, database status.
- **Typecheck:** before Claude finishes an answer, the typecheck runs for any app that changed.
