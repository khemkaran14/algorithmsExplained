import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { SignOutButton } from '@/components/sign-out-button';
import { db } from '@/lib/db';
import Link from 'next/link';
import { LearningDashboard } from '@/components/learning-dashboard';
export default async function Account() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const payments = await db.payment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-4xl font-semibold">Your account</h1>
      <p className="my-5 text-[var(--muted)]">
        {session.user.name ?? session.user.email}
      </p>
      <div className="mb-8">
        <SignOutButton />
      </div>
      <section className="my-8 rounded-2xl border border-[var(--border)] p-5">
        <h2 className="mb-4 text-xl font-semibold">Purchases & invoices</h2>
        {payments.length ? (
          payments.map((p) => (
            <div
              key={p.id}
              className="mb-3 flex flex-wrap justify-between gap-3 text-sm"
            >
              <span>
                INR {(p.amount / 100).toFixed(2)} · {p.status}
              </span>
              {['paid', 'refund-pending', 'refunded'].includes(p.status) && (
                <a href={`/api/invoices/${p.id}`} className="underline">
                  Download invoice
                </a>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-[var(--muted)]">
            No purchases yet.{' '}
            <Link href="/pricing" className="underline">
              Explore lifetime access
            </Link>
          </p>
        )}
      </section>
      <LearningDashboard signedIn />
    </section>
  );
}
