---
name: be-integration
description: "Connect the Dine Yerevan backend to an outside service (Google OAuth with Arctic, Cloudinary uploads, Resend emails, Google Places) through src/integrations/, with settings in env.ts, a fake for tests (never real network in tests), timeouts, and failures that never break the main flow. Use when a step needs an outside API or SDK."
argument-hint: "[service, e.g. cloudinary, resend, google-oauth, google-places]"
---

# Outside service

Service: $ARGUMENTS

1. **Account first.** Tell the user:
   - what to create, and where (roadmap section 8);
   - which keys go into `backend/.env`. The user pastes them there themselves, never into the chat;
   - which keys are public.
2. **Settings.** Add the variables to:
   - `src/config/env.ts`. In production the app must stop at startup when a secret is missing.
   - `backend/.env.example`, with a placeholder and a comment.
   - the README's environment-variable table.
3. **Wrapper:** `src/integrations/<service>.ts`.
   - A few small functions named in our own words: `sendEmail({ to, subject, html, text })`, `signUpload(folder)`, `deleteImage(publicId)`, `searchPlaces(district, pageToken)`.
   - The SDK or `fetch` stays inside this file. Services import only the wrapper.
4. **Tests never use the network.**
   - The wrapper has a test mode: an in-memory outbox for emails, saved JSON fixtures for Places, a fake signature for Cloudinary.
   - Mapping code, such as Places → our fields, is a pure function tested with fixtures.
5. **Failures:**
   - Set timeouts.
   - Log the error with context, but never the key.
   - Decide for each call whether a failure breaks the request:
     - Emails are sent **after** the database commit; if one fails, it is only logged.
     - Upload and login failures return a clear error.
6. **Security:**
   - Secrets stay on the server only.
   - Uploads are signed.
   - Restrict keys in the provider's console, e.g. the Maps browser key by website address.
7. **Check:**
   - `npm run lint && npm run typecheck && npm test`.
   - Then try it by hand with the real service, and tell the user what they should see.
