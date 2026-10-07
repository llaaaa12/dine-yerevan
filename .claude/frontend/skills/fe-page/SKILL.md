---
name: fe-page
description: "Build a Dine Yerevan frontend page: page component, route in routes.tsx (protected with RequireRole when needed), API functions and TanStack Query hooks in the feature folder, loading/empty/error states, mobile-first layout, and a test with MSW. Use for any new screen or route in frontend/ (e.g. 'add the restaurants list page', 'build the dashboard reservations page')."
argument-hint: "[page and route, e.g. 'RestaurantsPage /restaurants']"
---

# Build a frontend page

Page: $ARGUMENTS. Follow `.claude/frontend/rules/` (structure, ui, forms, testing) and `api-contract.md`.

1. **Plan.** Show the user:
   - the route path, and who can see the page;
   - the API calls it needs;
   - what goes into the URL (filters, page number);
   - a rough layout for phone and desktop.

   Check that the backend endpoints exist (the README table). If they don't, build them first with `/be-feature`.
2. **API:** add typed functions to `src/features/<feature>/<feature>.api.ts`, using `api`. The types mirror the backend's DTOs.
3. **Hooks:**
   - reads: `use<Thing>` with `useQuery({ queryKey: ['<feature>', params], queryFn })`;
   - changes: `useMutation`, plus invalidating the queries it changes.
4. **Components:** put them in the feature folder. The page itself, `src/pages/<Name>Page.tsx`, stays thin.
5. **Route:** add it to `src/routes.tsx`, inside `RootLayout`. Owner and admin pages go under `RequireRole`.
6. **States:** loading (`Skeleton`), empty (a friendly sentence plus the next action), error (a message plus retry). Filters and pagination live in the URL.
7. **UI rules:**
   - theme colors only;
   - the layout works at 375 px;
   - labels and headings are in place;
   - decorative icons get `aria-hidden`.
8. **Test:** `src/test/<name>-page.test.tsx` (follow `/fe-test`). Use MSW handlers for the calls, then check:
   - the data renders;
   - the empty state;
   - the error state;
   - one main interaction.
9. **Check:**
   - In `frontend/`, run `npm run lint && npm run typecheck && npm test`.
   - Then tell the user which URL to open after `npm run dev`. The backend must be running too.
