# Rule: security

Applies to every task.

## Secrets
- Secrets live only in `backend/.env` locally (gitignored) and in the hosting dashboards in production. Never put a real secret in code, tests, docs, commits or the chat.
- Never read, print or edit a `.env` file. Tell the user which variable to add.
- A new variable also goes into:
  - `backend/.env.example`, with a placeholder and a short comment;
  - the README.
- `backend/src/config/env.ts` is the only file that reads `process.env`. In production the app must stop at startup when a required secret is missing.
- Everything that starts with `VITE_` ends up in the browser bundle. Use it only for public values, such as the Maps browser key, and never for server keys.

## Login and access
- **Passwords:** argon2id (`@node-rs/argon2`).
- **Refresh and reset tokens:** random values, stored only as SHA-256 hashes.
- **Cookies:**
  - `httpOnly`, `sameSite: 'lax'`, and `secure` in production;
  - no tokens in localStorage or in cookies that JavaScript can read.
- **Login errors:** the same message for an unknown email and a wrong password.
- **Rate limits:** on login, register and forgot-password.
- **Access checks:**
  - Roles are checked with `requireAuth` / `requireRole(...)`.
  - Ownership is checked in the service. An owner's restaurant always comes from the logged-in user (`ownerId`), never from an id in the request.
  - Another user's data answers **404**, not 403.

## Data
- SQL uses parameters only: `$1` in raw SQL, named parameters in QueryBuilder. Never build SQL by joining strings with user input.
- Validate every input with Zod, including lengths (note ≤ 500, comment ≤ 1000).
- Never log passwords, tokens, cookies or whole request bodies.
- Error responses in production never contain stack traces or database messages.

## Uploads and outside services
- The backend signs Cloudinary uploads. Reject a `publicId` outside the restaurant's own folder.
- Restrict keys in the provider's console wherever possible, e.g. the Maps key by website address.
