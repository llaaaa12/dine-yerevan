import { dataSource } from '../db/data-source.js';

export function isDatabaseConnected(): boolean {
  return dataSource.isInitialized;
}

// Rejects when the database doesn't answer
export async function pingDatabase(): Promise<void> {
  await dataSource.query('SELECT 1');
}
