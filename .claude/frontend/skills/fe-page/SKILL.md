---
name: fe-page
description: "Build a Dine Yerevan frontend page the frontend-first way: design with sample data, then the API contract (typed api functions, TanStack Query hooks, realistic MSW fake answers) so it runs in mock mode, route in routes.tsx (RequireRole when needed), loading/empty/error states, mobile-first layout, and a test. Use for any new screen or route in frontend/ (e.g. 'add the restaurants list page', 'build the dashboard reservations page')."
argument-hint: "[page and route, e.g. 'RestaurantsPage /restaurants']"
---

# Build a frontend page

Page: $ARGUMENTS. Follow `.claude/frontend/rules/` (structure, ui, forms, testing) and `api-contract.md`. If the page is in `docs/tasks.md`, use its task IDs. Its tasks sit in groups 1 (design) and 2 (API) of the step.

1. **Plan.** Show the user:
   - the route path, and who can see the page;
   - what data it shows, and what goes into the URL (filters, page number);
   - a rough layout for phone and desktop.
2. **Design (group 1):**
   - Create `src/pages/<Name>Page.tsx` (kept thin) and the components in `src/features/<feature>/`.
   - Use sample data written in the component, with realistic Yerevan restaurants, times and prices.
   - Add the route to `src/routes.tsx`, inside `RootLayout`. Owner and admin pages go under `RequireRole`.
   - Follow the UI rules: theme colors only, a layout that works at 375 px, labels and headings in place, `aria-hidden` on decorative icons.
   - Let the user check the look with `npm run dev`.
3. **API contract (group 2):**
   - In `src/features/<feature>/<feature>.api.ts`, write the request and response types (the JSON the backend must send later) and typed functions using `api`.
   - Hooks: `useQuery({ queryKey: ['<feature>', params], queryFn })` for reads; `useMutation` plus invalidating the changed queries for changes.
   - In `src/test/msw/handlers.ts`, add handlers with realistic fake answers. Include one error case the page must handle, e.g. a 409 with its `code`.
   - Replace the sample data with the hooks.
4. **States:** loading (`Skeleton`), empty (a friendly sentence plus the next action), error (a message plus retry). Filters and pagination live in the URL.
5. **Try it in mock mode:** `npm run dev:mock` shows the page with the fake answers, without a backend.
6. **Test:** `src/test/<name>-page.test.tsx` (follow `/fe-test`). Check:
   - the data renders;
   - the empty state;
   - the error state;
   - one main interaction.
7. **Check:** in `frontend/`, run `npm run lint && npm run typecheck && npm test`. Tell the user the contract is ready for the backend part: `/be-feature` will implement exactly these types.
