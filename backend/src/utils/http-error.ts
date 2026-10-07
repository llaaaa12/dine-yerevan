type HttpErrorOptions = {
  // Extra data for the client, e.g. validation errors per field
  details?: unknown;
  // Stable machine-readable reason the frontend can react to, e.g. 'TABLE_TAKEN'
  code?: string;
};

// Throw from any handler or service: `throw new HttpError(404, 'Restaurant not found')`.
// Express 5 forwards thrown errors and rejected promises to the error handler.
export class HttpError extends Error {
  readonly status: number;
  readonly details?: unknown;
  readonly code?: string;

  constructor(
    status: number,
    message: string,
    { details, code }: HttpErrorOptions = {},
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
    this.code = code;
  }
}
