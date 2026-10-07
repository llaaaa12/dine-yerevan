// In development, Vite proxies /api to the backend (see vite.config.ts).
// Set VITE_API_URL at build time only if the API is served from another origin.
const API_URL: string = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

// The backend's error shape: { error: { message, details? } }
type ErrorBody = { error?: { message?: string; details?: unknown } };

async function request<T>(
  path: string,
  { body, ...init }: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = (data as ErrorBody | null)?.error;
    throw new ApiError(
      response.status,
      error?.message ?? response.statusText,
      error?.details,
    );
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
