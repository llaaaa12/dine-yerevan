---
name: finish-step
description: "Finish one part of a Dine Yerevan roadmap step (frontend or backend: that app's checks plus a commit command) or the whole step before its pull request (CI checks in both apps, shared tasks, 'Done when' list, README endpoint table, docs/tasks.md ticks, leftovers scan, PR text and git commands). Use when the user says a part or the step is done, wants to commit or open a PR, or asks if the branch is ready."
argument-hint: "[step] [part, optional: frontend | backend]; no part = the whole step"
---

# Finish a part or a whole step

Arguments: $ARGUMENTS. The first word is the step; an optional second word is the part. If no step was given, work it out from `git branch --show-current` and `docs/tasks.md`.

## A. Finishing one part (`frontend` or `backend`)
1. **Run that app's checks**, the same as CI. Fix each failure, explaining the fix, and run again until everything is green.
   - `frontend/`: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run format:check`.
   - `backend/`: `npm run lint`, `npm run typecheck`, `npm test` (needs Docker), `npm run format:check`.
2. **Compare with the plan:** list the tasks of the part's groups in `docs/tasks.md` as done, not done, or changed.
   - frontend part: groups 1–2;
   - backend part: groups 3–4.
3. **Contract check:**
   - Frontend part: every API call has realistic MSW handlers, and the pages work in `npm run dev:mock`.
   - Backend part: the real responses match the frontend's types and fake answers. List any difference and fix one side.
4. **Leftovers scan** in that app's changed files:
   - `console.log`, `debugger`, `it.only` / `describe.only`, `TODO`;
   - leftover sample data in components (after the API part);
   - secrets.
5. **Tick the finished tasks** of the part in `docs/tasks.md`.
6. **Commit command for the user.** They run it; add one line about what it does:
   ```bash
   git add -A
   git commit -m "feat(frontend): login and register pages (2.18–2.23)" -m "Co-Authored-By: …"
   ```
   First look at `git status` for files that must not be committed.

## B. Finishing the whole step (no part, or `shared`)
1. **Run all checks** in both apps (as in A.1) and report a short pass/fail table.
2. **Shared group:**
   - Do or verify the step's group-5 tasks.
   - Then try the step against the real backend, with `npm run dev` in both apps (not mock mode). Give the user the clicks to try, and fix what breaks.
3. **Compare with the plan:** every task of the step and every "Done when" box from `docs/roadmap.md`, as done, not done, or changed. For "not done", ask whether to finish it now or move it to a later step.
4. **Leftovers scan** in the whole branch diff (`git diff <base>...HEAD` plus uncommitted work), as in A.4. Also look for temporary debug endpoints and files that must not be committed (`.env`, `dist/`).
5. **Docs:**
   - README "API endpoints" rows for every new or changed endpoint (`| Method | Path | Who | What it does |`), plus new commands, env vars and setup notes.
   - Tick the step's tasks in `docs/tasks.md`.
   - If the step created a new convention (e.g. the pagination shape), offer `/add-rule`.
6. **Review:** suggest `/review-step` if it hasn't been run on this branch.
7. **PR text:**
   - The title, e.g. `feat: authentication (Step 2)`.
   - Then: a summary, the task IDs done, how to test by hand, a screenshot placeholder for UI changes, and the "Done when" checklist.
8. **Git commands for the user.** They run them; add one line per command about what it does:
   ```bash
   git status
   git add -A
   git commit -m "docs: README and tasks for Step 2 (2.24)" -m "Co-Authored-By: …"
   git push -u origin <branch>
   ```
   - Then give the PR link: `https://github.com/llaaaa12/dine-yerevan/compare/<base>...<branch>?expand=1`.
   - `<base>` is `main`, or the previous step's branch while that one isn't merged.
