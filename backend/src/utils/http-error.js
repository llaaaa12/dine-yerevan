// Throw from any handler or service: `throw new HttpError(404, 'Restaurant not found')`.
// Express 5 forwards thrown errors and rejected promises to the error handler.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}
