import { auth } from '@/auth';
import { api, json } from '@/lib/http';

export async function GET() {
  return api(async () => {
    const session = await auth();
    return json({ owner: session?.user?.id ?? null });
  });
}
