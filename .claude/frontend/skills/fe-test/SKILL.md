---
name: fe-test
description: "Write or extend Dine Yerevan frontend tests with Vitest, Testing Library and MSW: pages via renderRoute, components via renderWithProviders, API answers from MSW handlers, user-visible queries, and the loading/empty/error/success states. Use when adding frontend behavior, fixing a frontend bug, or when the user asks for frontend tests."
argument-hint: "[page, component or hook to test]"
---

# Frontend tests

Target: $ARGUMENTS. Follow `.claude/frontend/rules/testing.md`.

1. **List the cases**, and show them to the user:
   - success with data, empty, and loading;
   - errors: a 500, plus the 4xx/409 codes that matter;
   - the main interactions (filter, submit, cancel, …).
2. **File:** `frontend/src/test/<name>.test.tsx`. Use subfolders mirroring `src/` once there are many.
   ```tsx
   import { screen } from '@testing-library/react';
   import { http, HttpResponse } from 'msw';
   import { describe, expect, it } from 'vitest';

   import { server } from './msw/server.ts';
   import { renderRoute } from './render.tsx';

   describe('RestaurantsPage', () => {
     it('lists the restaurants from the API', async () => {
       server.use(http.get('/api/restaurants', () => HttpResponse.json({})));
       renderRoute('/restaurants');
       expect(await screen.findByRole('heading', { name: 'Restaurants' })).toBeInTheDocument();
     });
   });
   ```
3. **API data:**
   - Put calls that many tests need into the default handlers in `src/test/msw/handlers.ts`. Mock mode (`npm run dev:mock`) uses them too, so keep them realistic: they are the API contract.
   - Override one inside a single test with `server.use(...)`.
   - To check what was sent, read `await request.json()` inside the handler.
4. **Queries and interactions:**
   - Find things with `getByRole`, `getByLabelText` and `getByText`, and use `findBy…` after loading.
   - Interact with `fireEvent`, or with `@testing-library/user-event` once it's added (ask before adding it).
5. **Run** `npm test` in `frontend/` and show the result.
