---
name: be-cli
description: "Add a Dine Yerevan backend command-line script (src/cli/<name>.ts plus an npm script) such as seed, user:create-admin, restaurant:approve, claim:approve or import:places: argument parsing, database connection, calling services, clear output and exit codes. Use when a task needs an npm run command."
argument-hint: "[script, e.g. 'user:create-admin --email --password --name']"
---

# Backend CLI script

Script: $ARGUMENTS

1. **File:** `backend/src/cli/<kebab-name>.ts`.
   - Read the arguments with `parseArgs` from `node:util` (`--email`, `--slug`, …).
   - Check them, with Zod or simple checks, and print a usage line when they're wrong.
2. **Shape:**
   ```ts
   import { parseArgs } from 'node:util';

   import { dataSource } from '../db/data-source.js';

   const { values } = parseArgs({ options: { email: { type: 'string' } } });

   await dataSource.initialize();
   try {
     // Call service functions: the same business rules as the API, no raw SQL here.
     console.log('Done: …');
   } finally {
     await dataSource.destroy();
   }
   ```
   - On an expected problem, print a clear message and set `process.exitCode = 1`.
3. **npm script** in `backend/package.json`.
   - Name it `<group>:<action>` (`user:create-admin`, `restaurant:approve`, `claim:approve`, `import:places`), or one word (`seed`).
   - The command is `node --env-file-if-exists=.env --import @swc-node/register/esm-register src/cli/<name>.ts`.
4. **Safe to run twice:**
   - Seed and imports upsert (by slug, email or Google place ID) instead of creating duplicates.
   - Approvals check the current status first.
5. **Docs:** add the command to the README "Backend" commands table, with one line about what it does.
6. **Try it:** run it against the dev database and show the user the output. Add an API or service test for the logic it calls.
