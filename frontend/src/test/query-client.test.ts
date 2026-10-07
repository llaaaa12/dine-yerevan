import { describe, expect, it } from 'vitest';

import { ApiError } from '../lib/api-client.ts';
import { shouldRetry } from '../lib/query-client.ts';

describe('shouldRetry', () => {
  it('retries a network or server error once', () => {
    expect(shouldRetry(0, new TypeError('Failed to fetch'))).toBe(true);
    expect(shouldRetry(0, new ApiError(503, 'Service Unavailable'))).toBe(true);
    expect(shouldRetry(1, new ApiError(503, 'Service Unavailable'))).toBe(
      false,
    );
  });

  it('never retries a client error', () => {
    expect(shouldRetry(0, new ApiError(401, 'Unauthorized'))).toBe(false);
    expect(shouldRetry(0, new ApiError(404, 'Not Found'))).toBe(false);
  });
});
