// The only place that reads process.env — import `env` everywhere else.
const nodeEnv = process.env.NODE_ENV ?? 'development';

function readPort(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${name}: "${process.env[name]}"`);
  }
  return value;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined || value === '') {
    return fallback;
  }
  if (value !== 'true' && value !== 'false') {
    throw new Error(`Invalid ${name}: "${value}" (use true or false)`);
  }
  return value === 'true';
}

export const env = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: readPort('PORT', 3000),
  // Public address of the frontend: OAuth redirects and links in emails point here
  appUrl: process.env.APP_URL ?? 'http://localhost:5173',
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
    // Hosted databases such as Neon require TLS; the local Docker one doesn't use it
    ssl: readBoolean('DB_SSL', false),
  }),
});
