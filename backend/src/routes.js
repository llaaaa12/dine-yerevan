import { Router } from 'express';

import { healthRouter } from './modules/health/health.routes.js';

// Every feature module's router is mounted here; app.js serves them under /api.
export const router = Router();

router.use('/health', healthRouter);
