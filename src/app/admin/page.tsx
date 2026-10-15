import { redirect, notFound } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { AdminPanel } from '@/components/admin-panel';
export const metadata = {
  title: 'Administration',
  robots: { index: false, follow: false },
};
export default async function Admin() {
  const user = (await auth())?.user;
  if (!user?.id) redirect('/sign-in');
  if (
    (
      await db.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      })
    )?.role !== 'admin'
  )
    notFound();
  const [users, payments, coupons, totalUsers, totalPaid, refunded] =
    await Promise.all([
      db.user.findMany({
        take: 50,
        select: { id: true, name: true, email: true, role: true },
      }),
      db.payment.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          receipt: true,
          amount: true,
          status: true,
          userId: true,
        },
      }),
      db.coupon.findMany({
        take: 50,
        orderBy: { expiresAt: 'desc' },
        select: {
          id: true,
          code: true,
          kind: true,
          value: true,
          usedCount: true,
          maxUses: true,
        },
      }),
      db.user.count(),
      db.payment.aggregate({
        where: { status: { in: ['paid', 'refund-pending'] } },
        _sum: { amount: true },
      }),
      db.payment.count({ where: { status: 'refunded' } }),
    ]);
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="mb-8 text-4xl font-semibold">Administration</h1>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          [totalUsers, 'Accounts'],
          [
            `INR ${((totalPaid._sum.amount ?? 0) / 100).toFixed(2)}`,
            'Active captured payments',
          ],
          [refunded, 'Refunded orders'],
        ].map(([value, label]) => (
          <div
            key={label}
            className="rounded-2xl border border-[var(--border)] p-5"
          >
            <p className="font-mono text-2xl">{value}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">{label}</p>
          </div>
        ))}
      </div>
      <AdminPanel users={users} payments={payments} coupons={coupons} />
    </section>
  );
}
