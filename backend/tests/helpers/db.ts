import { dataSource } from '../../src/db/data-source.js';

// Tests that need the database call setupTestDb() in before(), resetDb() in beforeEach()
// and closeTestDb() in after(). `npm test` points DB_NAME at dine_yerevan_test.

export function assertTestDatabaseName(name: string) {
  if (!name.endsWith('_test')) {
    throw new Error(
      `Refusing to run tests against "${name}": the database name must end in _test`,
    );
  }
}

async function assertConnectedToTestDatabase() {
  const [{ current_database: name }] = await dataSource.query<
    { current_database: string }[]
  >('SELECT current_database()');
  assertTestDatabaseName(name);
}

export async function setupTestDb() {
  if (!dataSource.isInitialized) {
    try {
      await dataSource.initialize();
    } catch (err) {
      throw new Error(
        'Could not connect to the test database. Is Docker running (docker compose up -d) ' +
          'and does dine_yerevan_test exist (npm run db:test:create)?',
        { cause: err },
      );
    }
  }
  await assertConnectedToTestDatabase();
  await dataSource.runMigrations();
}

// Empties every entity table, so each test starts from a clean database
export async function resetDb() {
  await assertConnectedToTestDatabase();
  const tables = dataSource.entityMetadatas.map(
    (metadata) => `"${metadata.tableName}"`,
  );
  if (tables.length > 0) {
    await dataSource.query(
      `TRUNCATE ${tables.join(', ')} RESTART IDENTITY CASCADE`,
    );
  }
}

export async function closeTestDb() {
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
}
