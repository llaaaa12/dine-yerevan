---
name: fe-form
description: "Build a Dine Yerevan frontend form with React Hook Form + Zod and shadcn field components: schema, controlled fields with labels and errors, submit through a TanStack Query mutation, backend 400 field errors shown on the fields, known error codes, pending state and success toast, plus its test. Use for login, register, restaurant info, settings, tables, hours, blocks, booking, review or any other form."
argument-hint: "[form, e.g. 'login form' or 'restaurant settings']"
---

# Build a form

Form: $ARGUMENTS. Follow `.claude/frontend/rules/forms.md` and `ui.md`.

1. **Fields and limits.** Show the user each field: its type, whether it's required, and its limits.
   - If the backend validator already exists (`backend/src/validators/…`), match it.
   - If it doesn't (frontend first), these limits become the contract, and the backend validator will copy them.
2. **Schema**, in the feature folder:
   ```ts
   export const <name>Schema = z.object({ … });
   export type <Name>Values = z.infer<typeof <name>Schema>;
   ```
3. **Form:** `useForm<<Name>Values>({ resolver: zodResolver(<name>Schema), defaultValues })`.
   - Build each field with a `Controller` wrapped around `Field`, `FieldLabel`, the input and `FieldError` (from `@/components/ui/field`).
   - Set `aria-invalid` on invalid inputs.
4. **Submit:**
   - `const mutation = useMutation({ mutationFn, onSuccess })` and `form.handleSubmit((values) => mutation.mutate(values))`.
   - While pending, the button is disabled and says "Saving…".
   - Until the backend exists, MSW handlers in `src/test/msw/handlers.ts` answer the request, in the tests and in `npm run dev:mock`. Add a realistic success answer; the tests cover the 400 with `fieldErrors` using `server.use`.
5. **Server errors:**
   - On an `ApiError` 400, call `form.setError(field, { message })` for each entry of `details.fieldErrors`, and show `formErrors` above the form.
   - Known codes (`TABLE_TAKEN`, `CUSTOMER_OVERLAP`, 409 duplicates) get friendly sentences.
6. **Success:** `toast.success(…)` (from `sonner`), then invalidate the changed queries, then navigate away or reset the form.
7. **Test** in `src/test/`:
   - invalid input shows errors and doesn't call the API;
   - a valid submit sends the right JSON (the MSW handler reads `await request.json()`);
   - a server 400 shows the field message;
   - the button is disabled while pending.
8. **Check:** in `frontend/`, run `npm run lint && npm run typecheck && npm test`.
