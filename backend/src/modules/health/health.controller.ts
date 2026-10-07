import type { Request, Response } from 'express';

import { checkDatabase } from './health.service.js';

export async function getHealth(req: Request, res: Response) {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    database: await checkDatabase(),
  });
}
