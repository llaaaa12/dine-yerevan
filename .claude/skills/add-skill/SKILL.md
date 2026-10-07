---
name: add-skill
description: "Create a new Claude skill for Dine Yerevan in the right folder (whole project in .claude/skills/<name>/, backend in .claude/backend/skills/be-<name>/, frontend in .claude/frontend/skills/fe-<name>/), add the shortcut in .claude/skills/ so it works as a /command, and list it in CLAUDE.md. Use when the user wants a new skill, command or repeatable recipe."
argument-hint: "[what the skill should do]"
---

# Add a skill

Request: $ARGUMENTS. If empty, ask what the skill should do and when it should be used.

1. **Where and what name:**
   - Whole project → `.claude/skills/<name>/SKILL.md`.
   - Backend only → `.claude/backend/skills/be-<name>/SKILL.md`.
   - Frontend only → `.claude/frontend/skills/fe-<name>/SKILL.md`.
   - The `be-` / `fe-` prefix keeps the commands unique and shows which app they belong to.
   - Names are lowercase-with-hyphens.
   - Never reuse a name Claude Code already uses: `code-review`, `review`, `simplify`, `security-review`, `init`, `doctor`, `run`, `help`, `config`, `memory`, `loop`, `schedule`, …
2. **Write `SKILL.md`:**
   ```yaml
   ---
   name: <name>          # same as the folder
   description: "<what it does + when to use it, in words the user would say>"
   argument-hint: "[…]"  # only if it takes input; use $ARGUMENTS in the text
   ---
   ```
   - The body is a short numbered recipe.
   - Point to the rule files instead of repeating them.
3. **Add the shortcut for a backend or frontend skill**, because Claude Code only finds skills in `.claude/skills/`. From the repo root:
   - `ln -s ../backend/skills/be-<name> .claude/skills/be-<name>`, or `ln -s ../frontend/skills/fe-<name> .claude/skills/fe-<name>`;
   - then check with `ls -l .claude/skills/`.
4. **List the new skill** in the "Skills" table of `CLAUDE.md`.
5. **Tell the user how to use it:** `/<name> …`, or by asking in words.
   - New skills are picked up without restarting Claude Code. If one doesn't appear, run `/reload-skills`.
