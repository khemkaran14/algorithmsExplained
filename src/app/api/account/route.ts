import { api, json, readJson, requireSameOrigin } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { deleteAccount } from '@/account/server';
import { z } from 'zod';
export async function DELETE(request: Request) {
  return api(async () => {
    requireSameOrigin(request);
    const user = await requireUser();
    z.object({ confirmation: z.literal('DELETE MY ACCOUNT') })
      .strict()
      .parse(await readJson(request));
    await deleteAccount(user.id);
    return json({ deleted: true });
  });
}
