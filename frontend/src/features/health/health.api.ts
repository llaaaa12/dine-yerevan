import { api } from '../../lib/api-client.ts';

export type Health = {
  status: string;
  uptime: number;
  database: 'up' | 'down';
};

export function getHealth() {
  return api.get<Health>('/health');
}
