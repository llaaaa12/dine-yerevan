import type { RequestHandler } from 'express';

import { HttpError } from '../utils/http-error.js';

export const notFound: RequestHandler = (req, res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};
