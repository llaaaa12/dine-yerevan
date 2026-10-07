---
name: finish-step
description: "Finish a Dine Yerevan roadmap step before its pull request: run the same checks as CI in both apps, compare the work with the step's tasks and 'Done when' list, update the README endpoint table and docs/tasks.md, scan for leftovers, then write the PR text and the git commands for the user. Use when the user says the step is done, wants to open a PR, or asks if the branch is ready."
argument-hint: "[step, optional]"
---

# Finish a roadmap step

1. **Which step:** $ARGUMENTS. If none was given, work it out from `git branch --show-current` and `docs/tasks.md`.
2. **Run the checks** (same as CI) and report a short pass/fail table. Fix each failure, explaining the fix, and run the checks again until everything is green.
   - `backend/`: `npm run lint`, `npm run typecheck`, `npm test` (needs Docker).
   - `frontend/`: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
   - Both apps: `npm run format:check`. CI doesn't run it, but it keeps diffs clean.
3. **Compare with the plan:** list every task of the step from `docs/tasks.md`, and every "Done when" box from `docs/roadmap.md`, as done, not done, or changed. For each "not done", ask whether to finish it now or move it to a later step.
4. **Scan for leftovers** in the branch diff (`git diff <base>...HEAD` plus uncommitted changes):
   - `console.log`, `debugger`, `it.only` / `describe.only`, `TODO`;
   - commented-out code and temporary debug endpoints;
   - hard-coded secrets or URLs;
   - files that must not be committed (`.env`, `dist/`).
5. **Docs:**
   - README "API endpoints" table: one row per new or changed endpoint (`| Method | Path | Who | What it does |`). Also add new commands, environment variables and setup notes.
   - `docs/tasks.md`: tick the tasks finished in this step. They count once the PR is merged.
   - If this step created a new convention (e.g. the pagination shape), offer `/add-rule`.
6. **Review:** suggest `/review-step` if it hasn't been run on this branch yet.
7. **PR text:**
   - The title in Conventional Commits style with the step, e.g. `feat: authentication (Step 2)`.
   - Then: a summary, the task IDs done, how to test by hand, a screenshot placeholder for UI changes, and the "Done when" checklist.
8. **Git commands for the user.** They run them; Claude never does. Add one line per command about what it does:
   ```bash
   git status
   git add -A
   git commit -m "feat(backend): … (2.1–2.17)" -m "Co-Authored-By: …"
   git push -u origin <branch>
   ```
   - First look at the `git status` output for files that must not be committed.
   - Then give the PR link: `https://github.com/llaaaa12/dine-yerevan/compare/<base>...<branch>?expand=1`. `<base>` is `main`, or the previous step's branch while that one isn't merged.
