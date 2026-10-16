import { writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
const password = randomBytes(24).toString('hex');
const secret = randomBytes(48).toString('hex');
try {
  writeFileSync(
    '.env',
    `POSTGRES_PASSWORD=${password}\nDATABASE_URL=postgresql://algoverse:${password}@localhost:5432/algoverse\nAUTH_SECRET=${secret}\nAUTH_URL=http://localhost:3000\nRATE_LIMIT_MODE=memory\n`,
    { flag: 'wx', mode: 0o600 },
  );
} catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'EEXIST'))
    throw error;
}
