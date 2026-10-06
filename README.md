# Dine Yerevan

| App         | Stack                                   |
| ----------- | --------------------------------------- |
| `backend/`  | Node.js 24, Express 5, JavaScript (ESM) |
| `frontend/` | React (not set up yet)                  |

Editor and formatting settings (`.editorconfig`, `.prettierrc.json`) live at the repo root and are shared by both apps.

## Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev   # http://localhost:3000/api/health
```

| Command          | What it does                                                 |
| ---------------- | ------------------------------------------------------------ |
| `npm run dev`    | Start with auto-restart on file changes, loading `.env`      |
| `npm start`      | Start for production (env vars come from the environment)    |
| `npm test`       | Run the API tests (`node:test` + Supertest)                  |
| `npm run lint`   | Check code with ESLint (`npm run lint:fix` to auto-fix)      |
| `npm run format` | Format with Prettier (`npm run format:check` to only verify) |

### Structure

```
backend/
├── src/
│   ├── server.js        # entry point: starts the HTTP server, graceful shutdown
│   ├── app.js           # Express app: middleware, routes, error handling
│   ├── routes.js        # mounts every module's router under /api
│   ├── config/env.js    # the only place that reads process.env
│   ├── middlewares/     # cross-cutting middleware (404, error handler)
│   ├── modules/         # one folder per feature
│   │   └── health/      #   health.routes.js, health.controller.js
│   └── utils/           # shared helpers (HttpError)
└── tests/               # API tests
```

### Adding a feature

1. Create `src/modules/<feature>/` with `<feature>.routes.js` and `<feature>.controller.js`; put business logic and data access in `<feature>.service.js`.
2. Mount its router in `src/routes.js`, e.g. `router.use('/restaurants', restaurantsRouter)`.
3. For expected errors, `throw new HttpError(status, message)`. Express 5 sends thrown errors and rejected promises to the error handler, so handlers need no try/catch.
