---
name: start-step
description: "Start a Dine Yerevan roadmap step (e.g. 'start step 2', 'begin the reservations step'): read the step in docs/roadmap.md and docs/tasks.md, check the branch and the environment, ask the user the open decisions as options, and make a work plan before any code is written."
argument-hint: "[step, e.g. 2, 6 or 9.3]"
---

# Start a roadmap step

Step: $ARGUMENTS. If no step was given, ask which one.

1. **Read:**
   - the step's section in `docs/roadmap.md`: goal, tasks, tests, "Done when";
   - the same step in `docs/tasks.md`: task IDs, files, endpoints;
   - the rule files that apply (see `CLAUDE.md`).
2. **Check where we are** (read-only):
   - Run `git branch --show-current` and `git status --short`. The branch must be the one named in the step. If it isn't, give the user the command, e.g. `git switch -c feature/auth`; they run it. If the previous step's branch isn't merged into `main` yet, explain that the new branch will be stacked on it.
   - List any unticked tasks in `docs/tasks.md` from earlier steps that this step depends on.
   - Check that the database is up with `docker compose ps` (repo root). If it isn't, the user runs `docker compose up -d`.
3. **Open decisions:**
   - List every choice the roadmap leaves open for this step: library details, screen layout, naming, edge cases.
   - Ask them as 2–4 options with plain-language trade-offs, recommended first, a few at a time. Explain unfamiliar terms in the option text.
   - Wait for the answers.
4. **Accounts and keys:** if the step needs an outside account (roadmap section 8), give short setup instructions first:
   - where to click;
   - which variables the user puts into `backend/.env`. They never paste secrets into the chat.
5. **Plan:**
   - Write the work order as a short list grouped backend → frontend → tests → docs. Each line carries its task IDs, e.g. "2.1–2.4 entities + migration".
   - Name the skills that will be used (`/be-feature`, `/be-migration`, `/fe-page`, …).
6. **Wait for the user's go** before writing code. Then work through the plan. After each bigger part, tell the user how to try it.
