-- Runs only when Postgres starts with an empty data volume (first `docker compose up`).
-- Creates the separate database the backend tests use, so tests never touch dine_yerevan.
-- For an existing volume, create it once with: cd backend && npm run db:test:create
CREATE DATABASE dine_yerevan_test;
