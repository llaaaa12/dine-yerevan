import type { RequestHandler } from 'express';
import { z } from 'zod';

import { HttpError } from '../utils/http-error.js';

type RequestSchemas = {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
};

// Checks the request against Zod schemas before the handler runs:
//   router.post('/', validate({ body: createTableSchema }), createTable);
// The parsed values (coerced, trimmed, defaulted) are stored in res.locals.params/query/body,
// because Express 5 makes req.query read-only. Handlers read them from there.
export function validate(schemas: RequestSchemas): RequestHandler {
  return (req, res, next) => {
    for (const location of ['params', 'query', 'body'] as const) {
      const schema = schemas[location];
      if (!schema) continue;

      const result = schema.safeParse(req[location]);
      if (!result.success) {
        throw new HttpError(400, 'Validation failed', {
          // { location: 'body', formErrors: [...], fieldErrors: { email: [...] } }
          details: { location, ...z.flattenError(result.error) },
        });
      }
      res.locals[location] = result.data;
    }
    next();
  };
}
