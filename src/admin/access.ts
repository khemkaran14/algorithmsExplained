import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function requireAdminPage() {
  const user = (await auth())?.user;
  if (!user?.id) redirect('/sign-in');
  const stored = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (stored?.role !== 'admin') notFound();
  return user;
}
