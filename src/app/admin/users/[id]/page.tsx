import { PaymentEmailSync } from '@/components/payment-email-sync';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireAdminPage } from '@/admin/access';
import { db } from '@/lib/db';
import { PAGE_SIZE } from '@/admin/overview';

export const metadata = {
  title: 'User details',
  robots: { index: false, follow: false },
};
const query = z
  .object({ page: z.coerce.number().int().min(1).max(100000).default(1) })
  .strict();
const date = (value: Date | null, notRecorded: string) =>
  value
    ? value.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
    : notRecorded;

export default async function UserDetails({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const t = await getTranslations('adminUsers');
  const formatDate = (value: Date | null) => date(value, t('notRecorded'));
  const { id } = await params;
  const parsed = query.safeParse(await searchParams);
  if (!parsed.success || id.length > 128) notFound();
  const page = parsed.data.page;
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      accounts: { select: { provider: true } },
      entitlements: {
        where: { type: 'ALL_ACCESS', revokedAt: null },
        select: { source: true, grantedAt: true },
        orderBy: { grantedAt: 'desc' },
        take: 25,
      },
      _count: {
        select: {
          payments: true,
          progress: true,
          quizAttempts: true,
          bookmarks: true,
          notes: true,
        },
      },
    },
  });
  if (!user) notFound();
  const [payments, completed] = await Promise.all([
    db.payment.findMany({
      where: { userId: id },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        receipt: true,
        paymentEmail: true,
        amount: true,
        currency: true,
        status: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        createdAt: true,
        paidAt: true,
        refundedAt: true,
        emailReceipt: { select: { sentAt: true, attempts: true } },
      },
    }),
    db.lessonProgress.count({ where: { userId: id, status: 'completed' } }),
  ]);
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <Link href="/admin" className="underline">
        {t('back')}
      </Link>
      <h1 className="my-6 text-3xl font-semibold">{t('title')}</h1>
      <dl className="grid gap-4 rounded-2xl border border-[var(--border)] p-6 sm:grid-cols-2">
        {[
          [t('name'), user.name ?? t('notRecorded')],
          [t('accountEmail'), user.email ?? t('notRecorded')],
          [t('userId'), user.id],
          [t('role'), user.role],
          [t('emailVerified'), formatDate(user.emailVerified)],
          [
            t('providers'),
            user.accounts.map((a) => a.provider).join(', ') ||
              t('emailProvider'),
          ],
          [t('access'), user.entitlements.length ? t('lifetime') : t('free')],
          [t('payments'), user._count.payments],
          [t('started'), user._count.progress],
          [t('completed'), completed],
          [t('quizAttempts'), user._count.quizAttempts],
          [t('bookmarks'), user._count.bookmarks],
          [t('notes'), user._count.notes],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-[var(--muted)]">{label}</dt>
            <dd className="break-all font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <h2 className="mb-4 mt-8 text-2xl font-semibold">{t('activeGrants')}</h2>
      {user.entitlements.length ? (
        <ul className="space-y-2">
          {user.entitlements.map((e, index) => (
            <li key={index}>
              {e.source} · {formatDate(e.grantedAt)}
            </li>
          ))}
        </ul>
      ) : (
        <p>{t('noGrant')}</p>
      )}
      <h2 className="mb-4 mt-8 text-2xl font-semibold">
        {t('paymentHistory')}
      </h2>
      <p className="mb-5 text-sm text-[var(--muted)]">{t('paymentHelp')}</p>
      {!payments.length && <p>{t('noPayments')}</p>}
      <div className="space-y-5">
        {payments.map((p) => (
          <article
            key={p.id}
            className="rounded-2xl border border-[var(--border)] p-5"
          >
            <h3 className="break-all font-semibold">{p.receipt}</h3>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {[
                [t('paymentEmail'), p.paymentEmail ?? t('notRecorded')],
                [t('amount'), `${p.currency} ${(p.amount / 100).toFixed(2)}`],
                [t('status'), p.status],
                [t('orderId'), p.razorpayOrderId ?? t('notRecorded')],
                [t('paymentId'), p.razorpayPaymentId ?? t('notRecorded')],
                [t('created'), formatDate(p.createdAt)],
                [t('captured'), formatDate(p.paidAt)],
                [t('refunded'), formatDate(p.refundedAt)],
                [
                  t('receiptEmail'),
                  p.emailReceipt?.sentAt
                    ? t('sent', { date: formatDate(p.emailReceipt.sentAt) })
                    : p.emailReceipt
                      ? t('pending', { attempts: p.emailReceipt.attempts })
                      : t('notQueued'),
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[var(--muted)]">{label}</dt>
                  <dd className="break-all">{value}</dd>
                </div>
              ))}
            </dl>
            {!p.paymentEmail &&
              p.razorpayPaymentId &&
              ['paid', 'refund-pending', 'refunded'].includes(p.status) && (
                <PaymentEmailSync paymentId={p.id} />
              )}
          </article>
        ))}
      </div>
      <nav aria-label={t('pagination')} className="mt-6 flex gap-5">
        {page > 1 && (
          <Link
            className="underline"
            href={`/admin/users/${id}?page=${page - 1}`}
          >
            {t('previous')}
          </Link>
        )}
        <span>{t('page', { page, count: user._count.payments })}</span>
        {page * PAGE_SIZE < user._count.payments && (
          <Link
            className="underline"
            href={`/admin/users/${id}?page=${page + 1}`}
          >
            {t('next')}
          </Link>
        )}
      </nav>
    </section>
  );
}
