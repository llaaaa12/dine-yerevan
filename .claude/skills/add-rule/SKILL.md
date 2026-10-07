---
name: add-rule
description: "Add or update a rule for Claude in the right Dine Yerevan folder: whole project (.claude/skills/<topic>.md), backend (.claude/backend/rules/) or frontend (.claude/frontend/rules/). Use when the user says 'remember this rule', 'from now on always …', or when a step introduces a new convention."
argument-hint: "[the rule, in your own words]"
---

# Add a rule

Rule: $ARGUMENTS. If empty, ask what the rule is.

1. **Where:**
   - backend only → `.claude/backend/rules/`;
   - frontend only → `.claude/frontend/rules/`;
   - both apps, or the way we work → `.claude/skills/`. There it must be a plain `.md` file, never a folder, because folders there are skills.
2. **Which file:**
   - Read the existing rule files first. Add to the file on that topic if there is one.
   - Create a new `<topic>.md` only for a new topic. A new file starts with a heading (`# Backend rule: <topic>`, `# Frontend rule: <topic>`, or `# Rule: <topic>` for the whole project) and one line "Applies to …".
3. **Conflicts:** compare with the existing rules and with `CLAUDE.md`. If the new rule contradicts one, show both and ask which one wins. Then remove the losing one.
4. **Write it** short and concrete: one bullet, an example if it helps, and the reason in a few words when it isn't obvious.
5. **Show the user** the exact lines that were added or changed.
