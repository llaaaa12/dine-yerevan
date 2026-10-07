import { join } from 'node:path';

import { DataSource } from 'typeorm';

import { env } from '../config/env.js';

// Shared by the app and the TypeORM CLI (npm run migration:*).
export const dataSource = new DataSource({
  type: 'postgres',
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  ssl: env.db.ssl,
  // Any src/modules/<feature>/<name>.entity.ts is picked up automatically
  entities: [
    join(import.meta.dirname, '..', 'modules', '**', '*.entity.{ts,js}'),
  ],
  migrations: [join(import.meta.dirname, 'migrations', '*.{ts,js}')],
  // Schema changes only ever happen through migrations
  synchronize: false,
  logging: ['error', 'warn'],
});
