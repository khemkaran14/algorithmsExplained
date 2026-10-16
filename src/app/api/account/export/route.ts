import { api } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { exportAccount } from '@/account/server';
export async function GET() {
  return api(async () => {
    const user = await requireUser();
    return Response.json(await exportAccount(user.id), {
      headers: {
        'Content-Disposition': 'attachment; filename="algoverse-account.json"',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  });
}
