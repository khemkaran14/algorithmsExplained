import { api, json } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { hasAllAccess } from '@/payments/access';
export async function GET() {
  return api(async () => {
    const user = await requireUser();
    return json({ allAccess: await hasAllAccess(user.id) });
  });
}
