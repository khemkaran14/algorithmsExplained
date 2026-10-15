import { cpSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
if (existsSync('public'))
  cpSync('public', '.next/standalone/public', { recursive: true });
if (existsSync('content'))
  cpSync('content', '.next/standalone/content', { recursive: true });
// Next's trace can omit Prisma's dynamically loaded WASM compiler. Copy the
// generated client at its real pnpm-relative location, including verified WASM.
const require = createRequire(import.meta.url);
const clientRequire = createRequire(require.resolve('@prisma/client'));
const generated = path.dirname(clientRequire.resolve('.prisma/client/default'));
const relative = path.relative(process.cwd(), generated);
if (relative.startsWith('..'))
  throw new Error('Generated Prisma client must live inside the project.');
cpSync(generated, path.join('.next/standalone', relative), { recursive: true });
