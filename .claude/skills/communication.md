# Rule: communication

Applies to every task.

- **Plain language.** Use plain English and short sentences. Explain a technical term the first time it appears, e.g. "a transaction makes several database changes succeed or fail together".
- **Explanations go in the chat or the README, not in code.**
  - Code comments only for a non-obvious *why*. No line-by-line narration.
  - Never re-add comments the user deleted.
- **Before running a command that changes state** (database, Docker, files, packages), say in one line what it does.
- **Warn clearly before anything that deletes data:** `docker compose down -v`, `docker volume rm`, `npm run migration:revert`, SQL `DROP` / `TRUNCATE` / `DELETE`.
- **Docker is new to the user.** Explain containers, volumes and ports in beginner terms when they come up.
- **After a change, end with:**
  - what changed (the files);
  - why;
  - how to try it by hand (command, URL, what to click).
- **When something is unclear, ask one simple question about the outcome** ("what should happen?"). Don't guess, and don't ask about mechanisms.
- **If the user already built something** (files, folders, decisions), look at it first and describe it back before proposing changes.
- **The website itself is English only.**
