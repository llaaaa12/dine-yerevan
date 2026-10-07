# Frontend rule: UI and styling

Applies to every task in `frontend/` that changes what users see.

## Look
- **Colors:**
  - Tailwind classes only. Colors come from the theme variables in `src/index.css` (`bg-primary`, `text-muted-foreground`, `bg-card`, `border`, …).
  - No hex colors, no inline styles.
  - The brand red `#b4232a` is `primary`.
- **Light theme only:** no `dark:` styles, no theme switch.
- **shadcn/ui components first:**
  - Add new ones with `npx shadcn@latest add <name>`. Never install the shadcn CLI as a dependency.
  - `sonner.tsx` stays pinned to the light theme.
- **Icons** come from `lucide-react`. Decorative icons get `aria-hidden`.
- **Class names** are merged with `cn()` from `@/lib/utils`.

## Every screen that loads data shows three states
- **Loading:** `Skeleton` shapes, not an empty page.
- **Empty:** a friendly sentence and, if possible, the next action.
- **Error:** a short message and a retry button (`refetch`).

## Layout
- **Mobile first:** it must work at 375 px wide; then add `sm:` / `md:` / `lg:` for bigger screens.
- **Page width:** content stays inside `RootLayout`'s `max-w-6xl` container.
- **Touch and scroll:** buttons and links are at least 40 px tall, and there is no sideways scrolling.

## Accessibility
- **Semantic HTML:**
  - One `h1` per page, and headings in order.
  - `button` for actions, `Link` for navigation.
- **Labels and images:** every form control has a label. Images have `alt` text; decorative images get an empty `alt`.
- **Live messages** use `role="status"`.
- **Focus** stays visible; never remove outlines.
- **Text color:** gray text is never lighter than `text-muted-foreground`.

## Words
- English: short and friendly.
- Use the same domain words everywhere: restaurant, table, booking (reservation), guests, owner.
