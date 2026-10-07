# Rule: how we work

Applies to every task.

## Steps, branches and pull requests
- The plan is `docs/roadmap.md` and the checklist is `docs/tasks.md`. Every step is one branch and one pull request. The branch name is written in the step (`feature/auth`, `feature/reservations`, …).
- Before coding a step, read its section in both files. Never mix two steps in one branch.
- When the roadmap leaves a choice open, don't decide silently:
  - Offer 2–4 options with short plain-language trade-offs, recommended option first.
  - Ask a few questions at a time, and wait for the user's pick.
- If a step's scope, order or decisions change, update `docs/roadmap.md` and `docs/tasks.md` in the same branch.

## Order inside a step (frontend first)
`docs/tasks.md` groups every step's tasks in this order. Follow it.
1. **Frontend: design.** Pages, forms and components. Build them first with sample data written in the component, and check the look with `npm run dev`.
2. **Frontend: API.**
   - Write the `<feature>.api.ts` types and functions, the query hooks, and MSW handlers in `frontend/src/test/msw/handlers.ts` with realistic fake answers. Together they are the **API contract**.
   - Replace the sample data with the hooks, check the pages with `npm run dev:mock`, and write the frontend tests.
3. **Database.** Entities and migrations.
4. **Backend.** Repositories → services → validators → controllers → routes, with tests. The JSON must match the contract exactly.
5. **Shared.**
   - Docs, outside accounts and deploy settings.
   - Then try the step against the real backend (`npm run dev`), add the README endpoint rows, and check the "Done when" boxes.

- Skip groups a step doesn't have. Steps without screens start at group 3 or 4.
- Each step is still one branch and one pull request, with one commit per part: frontend (1–2), backend (3–4), shared (5).
- If the backend needs a different JSON shape, change the contract first (types + fake answers), then the backend. Never let the two drift apart.

## Git: the user runs it
- Claude never runs git commands that change something: `add`, `commit`, `push`, `pull`, `switch`, `checkout`, `merge`, `rebase`, `reset`, `stash`, `tag`, … Read-only git is fine: `status`, `diff`, `log`, `show`, `branch --show-current`.
- Give git commands as one copy-paste block, with a one-line explanation per command.
- Commit messages follow Conventional Commits:
  - Add a scope when only one app changes.
  - Put the task IDs at the end.
  - Add the `Co-Authored-By` trailer from Claude Code's attribution.
  - Examples: `feat(backend): refresh token rotation (2.9)` · `test(frontend): login form (2.23)` · `chore: CI cache`.
- `gh` isn't installed, so pull requests are opened from the compare link `https://github.com/llaaaa12/dine-yerevan/compare/<base>...<branch>?expand=1`. While the previous step isn't merged, branches are stacked: `<base>` is then the previous step's branch instead of `main`.

## Packages and versions
- Ask before adding, upgrading or removing a package. Say what it's for, what the alternatives are, and whether it's maintained. Never run `npm audit fix --force`.
- Packages with install scripts stay blocked in `allowScripts` (`package.json`) unless the user agrees.
- TypeScript stays at `~6.0`, because typescript-eslint and the SWC runner don't support 7 yet. Node must be ≥ 24.11.
- Add shadcn components with `npx shadcn@latest add <name>`. The shadcn CLI is never a project dependency.

## Scope
- Do what the task asks. If you notice other problems, mention them instead of fixing them silently.
- Every new behavior gets tests, and every new or changed endpoint gets a README row.
