# Frontend rule: forms

Applies to every form in `frontend/`.

- **Setup:** React Hook Form + Zod, via `useForm({ resolver: zodResolver(schema), defaultValues })`. The schema lives in the feature folder, and its lengths and ranges match the backend's validator.
- **Fields:** use the shadcn `field` components (`Field`, `FieldLabel`, `FieldError`, `FieldDescription`, `FieldGroup`) with React Hook Form's `Controller`. The old shadcn `form` component is retired; don't add it.
- **Labels and errors:**
  - Every input has a visible label.
  - The error message shows under the field.
  - An invalid input gets `aria-invalid`.
- **Submit:** through a `useMutation`. While it's pending, the submit button is disabled and shows progress ("Saving…").
- **Server validation errors (400):**
  - Copy each entry of `error.details.fieldErrors` into the form with `setError(field, { message })`.
  - Show `formErrors` above the form.
- **Known error codes** get a friendly sentence. Example: `TABLE_TAKEN` → "This table was just booked. Please choose another one."
- **Success:**
  - Show a toast (`sonner`), and invalidate the changed queries.
  - Then navigate away, or reset the form if it stays on screen.
- **Every form has a test:**
  - invalid input shows errors without calling the API;
  - a valid submit sends the right JSON;
  - a server error is shown.
