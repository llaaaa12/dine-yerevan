import { dataSource } from '../../db/data-source.js';

export async function checkDatabase(): Promise<'up' | 'down'> {
  if (!dataSource.isInitialized) {
    return 'down';
  }
  try {
    await dataSource.query('SELECT 1');
    return 'up';
  } catch {
    return 'down';
  }
}
