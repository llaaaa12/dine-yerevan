import { setupServer } from 'msw/node';

import { handlers } from './handlers.ts';

// Intercepts fetch() in tests and answers with the handlers instead of a real backend
export const server = setupServer(...handlers);
