import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
let instance: PrismaClient | undefined;

// Public pages and builds must not open a database connection. The adapter only
// touches the client when an actual authentication operation needs persistence.
export const db = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    instance ??= globalForPrisma.prisma ?? new PrismaClient();
    if (process.env.NODE_ENV !== 'production')
      globalForPrisma.prisma = instance;
    const value: unknown = Reflect.get(instance, property, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
