// The only place that reads process.env — import `env` everywhere else.
const nodeEnv = process.env.NODE_ENV ?? 'development';

function readPort(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${name}: "${process.env[name]}"`);
  }
  return value;
}

export const env = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: readPort('PORT', 3000),
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim()),
  // Defaults match the local Docker database in compose.yaml
  db: Object.freeze({
    host: process.env.DB_HOST ?? 'localhost',
    port: readPort('DB_PORT', 5432),
    user: process.env.DB_USER ?? 'dine',
    password: process.env.DB_PASSWORD ?? 'dine',
    name: process.env.DB_NAME ?? 'dine_yerevan',
  }),
});
