/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // `@/components/ui/button` → src/components/ui/button (same alias as in tsconfig)
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // API calls go to the backend dev server (cd backend && npm run dev)
      '/api': 'http://localhost:3000',
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/test/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
  },
});
