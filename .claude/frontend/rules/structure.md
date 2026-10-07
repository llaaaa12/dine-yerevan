# Frontend rule: structure and server data

Applies to every task in `frontend/`.

## Folders
| Path | Holds |
| --- | --- |
| `src/routes.tsx` | every route; pages render inside `RootLayout` |
| `src/pages/<Name>Page.tsx` | one component per route, kept thin: layout + feature components |
| `src/pages/dashboard/`, `src/pages/admin/` | the owner and admin areas (from Steps 4 and 9) |
| `src/features/<feature>/` | `<feature>.api.ts` (API functions), `use<Thing>.ts` hooks, feature components, form schemas |
| `src/components/` | shared components (`RootLayout`, `RequireRole`, …) |
| `src/components/ui/` | shadcn/ui components: our own copies, edit freely |
| `src/lib/` | `api-client.ts`, `query-client.ts`, `utils.ts` (`cn`) |
| `src/test/` | every test (see `testing.md`) |

## TypeScript and imports
- **Exports:** use named exports. Component files are named in PascalCase.
- **Imports:**
  - Use `@/…` for shadcn components and `lib` (`@/components/ui/button`, `@/lib/utils`).
  - Relative imports keep the file extension (`./health.api.ts`, `../features/health/ApiStatus.tsx`).
- **`verbatimModuleSyntax` is on:** type-only imports use `import type`.
- **`erasableSyntaxOnly` is on:** no `enum`, `namespace` or constructor parameter properties. Use union types and `as const` objects instead.

## Server data (TanStack Query)
- **The data flow is:** `<feature>.api.ts` → hooks → components.
  - `<feature>.api.ts` holds typed functions that use `api` from `@/lib/api-client`.
  - Hooks wrap those functions with `useQuery` / `useMutation`.
  - Components never call `fetch` or `api` directly, and never load data in `useEffect`.
- **Query keys** are arrays that start with the feature: `['restaurants', params]`, `['restaurant', slug]`, `['me']`.
- **After a mutation**, invalidate or update every query it changes.
- **Errors** arrive as `ApiError` (`status`, `code`, `details`). React to `code`, never to the message text. Example: `TABLE_TAKEN` → toast + reload the free tables.
- **Retries:** `shouldRetry` already retries network and 5xx errors once. Don't override it for a single query without a reason.

## Sample data and mock mode (frontend first)
- **Design part:** components may show sample data written right in the component, with realistic Yerevan examples. In the API part, replace it with the hooks. No sample data stays in components after that.
- **Mock mode:** `npm run dev:mock` (`vite --mode mock`) runs the app in the browser with the MSW handlers from `src/test/msw/handlers.ts`.
  - `main.tsx` starts the MSW worker only in this mode, so production builds don't contain it.
  - Requests without a handler go on to the real backend.

## Routing and state
- **Filters, search and pagination** live in the URL (`useSearchParams`), so links and the back button work.
- **Protected areas** use a `RequireRole` layout route (from Step 2). It shows loading, then redirects to `/login` with `from`, or shows the 403 page.
- **Dates:**
  - Show Yerevan time, with `@date-fns/tz` and `Asia/Yerevan`.
  - Send `date` (`YYYY-MM-DD`) and `time` (`HH:mm`) the way the API expects them.
