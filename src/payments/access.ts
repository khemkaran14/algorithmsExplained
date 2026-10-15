import 'server-only';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import type { LessonMeta } from '@/content/catalog';
export async function hasAllAccess(userId: string) {
  return Boolean(
    await db.entitlement.findFirst({
      where: { userId, type: 'ALL_ACCESS', revokedAt: null },
    }),
  );
}
export async function canReadLesson(meta: LessonMeta) {
  if (meta.isFree) return true;
  const user = (await auth())?.user;
  return Boolean(user?.id && (await hasAllAccess(user.id)));
}
