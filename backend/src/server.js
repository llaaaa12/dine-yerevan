import { app } from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.port, (err) => {
  // Express 5 passes startup errors (e.g. port already in use) to this callback
  if (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
  console.log(`API listening on http://localhost:${env.port} (${env.nodeEnv})`);
});

function shutdown(signal) {
  console.log(`${signal} received, closing server...`);
  server.close(() => process.exit(0));
  // Force exit if open connections keep the server from closing in time
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
