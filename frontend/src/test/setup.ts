import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './msw/server.ts';

// Any request without a handler fails the test instead of silently reaching the network
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  // Vitest globals are off, so Testing Library can't register this cleanup itself
  cleanup();
  // Drop handlers added with server.use() inside a test
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
