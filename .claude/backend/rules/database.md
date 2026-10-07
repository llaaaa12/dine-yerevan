# Backend rule: database (TypeORM + PostgreSQL 18)

Applies to every backend task that touches entities, queries, migrations or the seed.

## Entities
- **One class per table** in `src/entities/<name>.entity.ts`; files there are loaded automatically.
- **Names:** tables are plural snake_case via `@Entity('reservations')` / `@Entity('refresh_tokens')`. Columns keep TypeORM's camelCase, so raw SQL must quote them: `"startsAt"`, `"tableId"`.
- **Ids** use `@PrimaryGeneratedColumn('uuid')`.
- **Times:** moments are `timestamptz` (`@CreateDateColumn({ type: 'timestamptz' })`, `@UpdateDateColumn(...)`). Opening hours use `time`.
- **Status, role and source columns** are `varchar` + `@Check(...)` listing the allowed values. Never use Postgres enums: changing an enum can break the exclusion constraint.
- **Relations:** wrap the type in `Relation<...>` (needed for ES modules with circular imports), and always set `onDelete`:
  - `CASCADE` for owned children such as photos and opening hours;
  - `RESTRICT` for reservation → table.
- **Database rules live in the database:** `@Check`, `@Unique`, `@Exclusion`, `NOT NULL`, foreign keys, and indexes for frequent filters (`restaurantId + startsAt`).

## Migrations
- The schema changes only through migrations; `synchronize` stays `false`.
- Generate a migration from entity changes with `npm run migration:generate -- src/db/migrations/<PascalCaseName>`. Read the SQL before `npm run migration:run`. The `/be-migration` skill has the checklist.
- Never edit a migration that is already committed; write a new one instead.
- Migrations are kept out of Prettier on purpose: keep them as generated. The exception is reviewed additions like `CREATE EXTENSION IF NOT EXISTS btree_gist`.
- `down()` must undo exactly what `up()` did.

## Queries and transactions
- **Every query lives in `repositories/`.** Each function takes `manager: EntityManager = dataSource.manager` as its last parameter.
- **Inside a transaction, use only its `manager`.** In `dataSource.transaction(async (manager) => …)`, every query goes through that `manager`, never the global `dataSource`, which can freeze the connection pool under load.
- **Lock in a fixed order** to avoid deadlocks: the restaurant row first, then the table row. Bookings use `setLock('pessimistic_read')`; blocks use `setLock('pessimistic_write')`.
- **Overlap queries** use `tstzrange("startsAt", "endsAt", '[)') && tstzrange($1, $2, '[)')`, and look only at active statuses.
- **Yerevan-day queries** use `("startsAt" AT TIME ZONE 'Asia/Yerevan')::date = $1`.
- **Parameters only:** `:name` in QueryBuilder, `$1` in raw SQL. Never put input into SQL by joining strings.

## Postgres errors → HTTP
These are mapped only in `middlewares/error-handler.ts`.

| Postgres code | Meaning | HTTP |
| --- | --- | --- |
| `23505` | unique violation | 409 |
| `23514` | check violation | 400 |
| `23P01` | exclusion violation | 409 `TABLE_TAKEN` / `CUSTOMER_OVERLAP`, chosen by `driverError.constraint` |
| `23503` | foreign key violation | 409 ("switch the table off instead") |

## Seed
`npm run seed` (`src/cli/seed.ts`) is safe to run again: it upserts by slug or email. It grows with each step: restaurants → tables and hours → reservations → reviews.
