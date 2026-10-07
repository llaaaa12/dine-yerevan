---
name: env-check
description: "Diagnose the Dine Yerevan local development setup: Docker, the Postgres container, the dev and test databases, pending migrations, Node version, backend/.env present, dependencies installed and ports. Give the exact fix command for every problem. Use when something won't start, tests can't reach the database, or the user asks why it doesn't work."
allowed-tools: "Bash(docker info *), Bash(docker compose ps *), Bash(docker compose exec -T db psql *), Bash(node --version), Bash(npm run migration:show *), Bash(test -f *), Bash(ss -ltn *)"
---

# Environment check

Run the checks read-only, from the repo root unless a folder is given. Then report a table with the columns **check · result · fix**.

- Explain each fix in beginner terms: what the command does and what it changes.
- Never print the contents of `.env`.

| # | Check | How | Fix |
| --- | --- | --- | --- |
| 1 | Docker is running | `docker info --format '{{.ServerVersion}}'` | start Docker (Docker Desktop, or `sudo systemctl start docker`) |
| 2 | The database container is up and healthy | `docker compose ps` → service `db` is `running (healthy)` | `docker compose up -d` |
| 3 | The dev database answers | `docker compose exec -T db psql -U dine -d dine_yerevan -c 'select 1'` | look at `docker compose logs db` |
| 4 | The test database exists | `docker compose exec -T db psql -U dine -d postgres -tAc "select 1 from pg_database where datname = 'dine_yerevan_test'"` → `1` | `cd backend && npm run db:test:create` |
| 5 | Migrations are applied | in `backend/`: `npm run migration:show`; lines with `[ ]` are pending | `npm run migration:run` |
| 6 | Node is 24.11 or newer | `node --version` | install Node 24 (mise / nvm) |
| 7 | `backend/.env` exists (its contents are not read) | `test -f backend/.env` | the user runs `cp backend/.env.example backend/.env` |
| 8 | Dependencies are installed | `test -f backend/node_modules/.package-lock.json`; same for `frontend/` | `npm install` in that folder |
| 9 | Ports | `ss -ltn` → 3000 (API), 5173 (Vite), 5432 (Postgres) | stop the program that holds a busy port |

If everything is fine, say so in one line. If Docker itself isn't running, stop after check 1 and explain how to start it.
