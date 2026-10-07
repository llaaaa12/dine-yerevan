---
name: start-step
description: "Start a Dine Yerevan roadmap step, or one part of it (e.g. 'start step 2', 'start the backend of step 3'): read the step in docs/tasks.md and docs/roadmap.md, check the branch and the environment, ask the user the open decisions as options, and make a work plan in the frontend-first order before any code is written."
argument-hint: "[step, e.g. 2 or 9.3] [part, optional: frontend | backend | shared]"
---

# Start a roadmap step

Arguments: $ARGUMENTS. The first word is the step; an optional second word is the part. If no step was given, ask which one.

Each step's tasks in `docs/tasks.md` are grouped in the frontend-first order (see `.claude/skills/workflow.md`). The parts map to those groups:

| Part | Groups | Rules to follow |
| --- | --- | --- |
| `frontend` | 1. Frontend: design, 2. Frontend: API | `.claude/skills/` + `.claude/frontend/` |
| `backend` | 3. Database, 4. Backend | `.claude/skills/` + `.claude/backend/` |
| `shared` | 5. Shared | all three folders |

Without a part, plan the whole step and start with the first group that still has open tasks.

1. **Read:**
   - the step's section in `docs/tasks.md`: its groups, task IDs, files and endpoints;
   - the step in `docs/roadmap.md`: goal, tests, "Done when";
   - the rule files for the part (table above).
2. **Check where we are** (read-only):
   - Run `git branch --show-current` and `git status --short`. The branch must be the one named in the step. If it isn't, give the user the command, e.g. `git switch -c feature/auth`; they run it. If the previous step isn't merged into `main` yet, explain that the new branch will be stacked on it.
   - List any unticked tasks of earlier steps, or earlier groups of this step, that this part depends on.
   - **Backend part:** check that the database is up with `docker compose ps` (repo root). If it isn't, the user runs `docker compose up -d`.
   - **Backend part:** read the contract the frontend part wrote: the `<feature>.api.ts` types and the MSW handlers.
   - **Frontend part:** no backend is needed. The pages are checked with sample data, then with `npm run dev:mock`.
3. **Open decisions:**
   - List the choices the roadmap leaves open for this part: screen layout, wording, JSON field names, edge cases, library details.
   - Ask them as 2–4 options with plain-language trade-offs, recommended first, a few at a time. Explain unfamiliar terms in the option text.
   - Wait for the answers.
4. **Accounts and keys:** if this part needs an outside account (roadmap section 8), give short setup instructions first:
   - where to click;
   - which variables the user puts into `backend/.env`. They never paste secrets into the chat.
5. **Plan:**
   - Write the work order group by group, each line with its task IDs, e.g. "1. design: 2.20–2.21 login and register pages".
   - Name the skills that will be used: `/fe-page`, `/fe-form`, `/fe-test` for the frontend; `/be-migration`, `/be-feature`, `/be-test` for the backend.
6. **Wait for the user's go** before writing code. Then work group by group.
   - After each group, tell the user how to try it. Design: `npm run dev`. API: `npm run dev:mock`. Backend: tests and a `curl` command.
   - When the part is done, suggest `/finish-step <step> <part>`.
