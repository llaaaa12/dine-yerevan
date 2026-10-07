import { app } from './app.js';
import { env } from './config/env.js';
import { dataSource } from './db/data-source.js';

try {
  await dataSource.initialize();
} catch (err) {
  console.error(
    'Could not connect to the database. Is it running? (docker compose up -d)',
  );
  console.error(err);
  process.exit(1);
}

const server = app.listen(env.port, (err) => {
  if (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
  console.log(`API listening on http://localhost:${env.port} (${env.nodeEnv})`);
});

function shutdown(signal: NodeJS.Signals) {
  console.log(`${signal} received, closing server...`);
  server.close(async () => {
    await dataSource.destroy();
    process.exit(0);
  });
  // Force exit if open connections keep the server from closing in time
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
