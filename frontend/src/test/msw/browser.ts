import { setupWorker } from 'msw/browser';

import { handlers } from './handlers.ts';

// Mock mode (npm run dev:mock): the browser gets the same fake answers as the tests
export const worker = setupWorker(...handlers);
