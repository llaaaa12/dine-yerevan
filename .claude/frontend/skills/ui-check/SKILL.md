---
name: ui-check
description: "Check a Dine Yerevan page for phone and desktop layout, loading/empty/error states, accessibility (labels, headings, focus, contrast, alt text) and consistent styling, then list and fix the problems. Use before finishing a UI step, for the Step 11 polish, or when the user asks whether a page looks right."
argument-hint: "[page or route, e.g. /restaurants]"
---

# UI check

Page: $ARGUMENTS

1. **Read** the page, its feature components, and `.claude/frontend/rules/ui.md`.
2. **Code checklist** (always):
   - **Layout:** mobile-first classes, no fixed widths that break at 375 px, no sideways scrolling, content inside the `max-w-6xl` container.
   - **States:** loading (`Skeleton`), empty, and error with retry, for every query on the page.
   - **Accessibility:**
     - one `h1`, and headings in order;
     - a label on every control, `alt` on images, `aria-hidden` on decorative icons;
     - buttons vs links used correctly, visible focus, `role="status"` for live messages.
   - **Styling:** theme colors only (no hex), shadcn components, even spacing, light theme only.
   - **Words:** English, short, the same domain words everywhere.
3. **In the browser**, when a browser tool is connected and the user agrees:
   - Run `npm run dev:mock` (no backend needed), or both dev servers.
   - Open the page at 375 px and at 1280 px wide, and take screenshots.
   - Check the empty and error states too, e.g. by stopping the backend, or by a temporary MSW handler that returns an empty list or a 500.
4. **Report** a short list of problems, each with where it is (`path:line`) and the fix.
   - Fix them if the user agrees.
   - Then run `npm run lint && npm run typecheck && npm test` in `frontend/`.
