import { Router } from 'express';

import { healthRouter } from './health.routes.js';

// Mounts every feature's router; app.ts serves them all under /api
export const router = Router();

router.use('/health', healthRouter);
