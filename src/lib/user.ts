import 'server-only';
import { auth } from '@/auth';
import { ApiError } from './http';
import { db } from './db';
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError(401, 'Sign in to continue.');
  return { ...session.user, id: session.user.id };
}
export async function requireAdmin() {
  const user = await requireUser();
  const saved = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (saved?.role !== 'admin')
    throw new ApiError(403, 'Administrator access is required.');
  return user;
}
