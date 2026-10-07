import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFound } from './middlewares/not-found.js';
import { router } from './routes/index.js';

export const app = express();

if (!env.isTest) {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
}
app.use(helmet());
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json());
// Fills req.cookies; the auth cookies (Step 2) are read from there
app.use(cookieParser());

app.use('/api', router);

app.use(notFound);
app.use(errorHandler);
