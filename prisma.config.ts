import { defineConfig } from 'prisma/config';
import { PrismaPg } from 'prisma-migration-adapter';
import { loadEnvFile } from 'node:process';
try {
  loadEnvFile('.env');
} catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT'))
    throw error;
}
export default defineConfig({
  schema: 'prisma/schema.prisma',
  experimental: { adapter: true },
  engine: 'js',
  adapter: async () =>
    new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
