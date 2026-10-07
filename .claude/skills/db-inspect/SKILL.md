---
name: db-inspect
description: "Look inside the local Dine Yerevan PostgreSQL database read-only: list tables, show a table's columns, constraints and indexes, count or sample rows, check the bookings of a restaurant or a day, and explain the result in plain English. Use when the user asks what is in the database, wants to see a table or a constraint, or to debug data."
argument-hint: "[question, e.g. 'constraints on reservations' or 'bookings for table 3 today']"
allowed-tools: "Bash(docker compose exec -T db psql *)"
---

# Look inside the database (read-only)

Question: $ARGUMENTS

- **Connect** from the repo root: `docker compose exec -T db psql -U dine -d dine_yerevan -c "<SQL>"`. Use `-d dine_yerevan_test` only when the user asks about the test database.
- **Read-only:** use only `SELECT`, `\dt`, `\d+` and `EXPLAIN`.
  - Never run `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `DROP`, `ALTER` or `CREATE` here.
  - If the user wants to change data, explain the command and what it changes, and let them decide.
- **Columns are camelCase** and must be quoted: `select "startsAt", status from reservations`.
- **Show times in Yerevan:** `"startsAt" AT TIME ZONE 'Asia/Yerevan'`.
- **Useful commands:**
  - `\dt`: list tables.
  - `\d+ reservations`: columns, checks, exclusion constraints and indexes.
  - `select count(*) from …`.
  - Add `limit 20` to samples.
- **Never select `passwordHash` or token hashes.**
- **Explain the result in plain English:** what the rows mean, and how they connect to the code (entity, constraint name, rule).
