---
name: review-step
description: "Review the current Dine Yerevan branch against its roadmap step's tasks and the project's rules (layers, database and transactions, Yerevan time, double booking, security, tests, docs). A fresh read-only reviewer that reports findings with file:line. Use when the user asks to review their code, the branch or a step. Claude Code's built-in /code-review is the general bug hunter; this one checks our rules and plan."
argument-hint: "[base branch, optional; default main, or the previous step's branch]"
context: fork
agent: general-purpose
---

# Review the current step

You are a careful reviewer. **Read only:** don't edit files, and don't run git commands that change anything.

1. **Scope:**
   - Find the branch with `git branch --show-current`.
   - The base is $ARGUMENTS if given. Otherwise it's `main`, or the previous step's branch when this branch is stacked on it (check with `git log --oneline main..HEAD`).
   - The changes to review are `git diff <base>...HEAD`, plus uncommitted work (`git diff HEAD`, and `git status --short` for new files).
2. **Read the yardsticks:**
   - the step in `docs/roadmap.md` and `docs/tasks.md`;
   - the rules in `.claude/skills/*.md`;
   - `.claude/backend/rules/` and/or `.claude/frontend/rules/` for the apps the diff touches.
3. **Check, in this order:**
   1. **Correctness:** logic bugs, wrong status codes, missing `await`, off-by-one times, wrong time zone, overlap logic (`[start, end)`), queries inside a transaction that don't use `manager`.
   2. **The graded core:** exclusion constraints intact, the right active statuses, locks taken in order, 409 codes.
   3. **Security:** ownership taken from the logged-in user, no secrets, every input validated, no internals in errors, cookie flags.
   4. **Rules:** layers (who calls whom), file names, DTOs, frontend data flow (TanStack Query, no fetch in components), forms, UI states, accessibility.
   5. **Tests:** every new behavior and its error cases (400/401/403/404/409) are covered; frontend tests are in `src/test/`.
   6. **Plan and docs:** every task of the step is done or explained, the README has the endpoint rows, and `docs/tasks.md` is ticked.
4. **Report**, most important first:
   - For each finding give:
     - severity: **must fix**, **should fix** or **nit**;
     - `path:line`;
     - what's wrong, and why it matters;
     - a concrete fix.
   - Then list the step's tasks that are missing.
   - End with a short note on what is good. If nothing is wrong, say so plainly.
