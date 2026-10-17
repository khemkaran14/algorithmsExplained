import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
const local = loadEnv('test', process.cwd(), 'DATABASE_URL');
if (!process.env.DATABASE_URL && local.DATABASE_URL)
  process.env.DATABASE_URL = local.DATABASE_URL;
export default defineConfig({
  plugins: [react()],
  ssr: { noExternal: ['next-auth'] },
  resolve: {
    alias: {
      'server-only': fileURLToPath(
        new URL('./tests/server-only.ts', import.meta.url),
      ),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
