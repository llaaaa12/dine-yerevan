# Frontend rule: testing

Applies to every frontend task that changes behavior.

- **Where tests live:** every test file is in `frontend/src/test/`, named `<name>.test.ts(x)`.
  - Vitest only runs `src/test/**/*.test.{ts,tsx}`, so a test anywhere else silently never runs.
  - When there are many, group them in subfolders that mirror `src/` (`src/test/features/booking/…`).
- **Imports:** Vitest globals are off. Import `describe`, `it`, `expect` and `vi` from `vitest`.
- **Rendering:**
  - A whole page: `renderRoute('/path')`.
  - One component: `renderWithProviders(<X />)`.
  - Both come from `src/test/render.tsx` and use a fresh query cache with no retries.
- **API answers come from MSW:**
  - The defaults are in `src/test/msw/handlers.ts`. They are the API contract, and mock mode shows them in the browser, so keep them realistic: the real field names and types, and plausible Yerevan data.
  - To change one inside a single test: `server.use(http.get('/api/…', () => HttpResponse.json(…)))`.
  - A request without a handler fails the test (`onUnhandledRequest: 'error'`).
- **Queries:** find things the way a user does: `getByRole`, `getByLabelText`, `getByText`. Use `findBy…` for anything that appears after loading. No test ids unless there is no accessible way.
- **Interactions:**
  - Use `fireEvent` for now.
  - `@testing-library/user-event` is better, but it isn't installed; ask before adding it.
- **Cover the states:**
  - loading, empty, error and success;
  - for forms: validation, submit and server error.
- **Isolation:** each test sets up its own data, with no shared changing state between tests.
