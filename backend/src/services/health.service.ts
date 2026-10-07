import {
  isDatabaseConnected,
  pingDatabase,
} from '../repositories/health.repository.js';

// The database counts as up when the connection is open and it answers a query
export async function checkDatabase(): Promise<'up' | 'down'> {
  if (!isDatabaseConnected()) {
    return 'down';
  }
  try {
    await pingDatabase();
    return 'up';
  } catch {
    return 'down';
  }
}
