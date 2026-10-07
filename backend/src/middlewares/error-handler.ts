import type { ErrorRequestHandler } from 'express';

import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';

// Express recognizes error handlers by their 4 parameters, so keep all of them.
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const status =
    Number.isInteger(err.status) && err.status >= 400 && err.status < 600
      ? err.status
      : 500;
  const isServerError = status >= 500;

  if (isServerError) {
    console.error(err);
  }

  res.status(status).json({
    error: {
      // Never leak the internals of unexpected errors to clients
      message: isServerError ? 'Internal Server Error' : err.message,
      // Only our own HttpError codes; other errors (pg, Node) carry internal codes
      ...(err instanceof HttpError && err.code && { code: err.code }),
      ...(err.details && { details: err.details }),
      ...(isServerError && !env.isProduction && { stack: err.stack }),
    },
  });
};
