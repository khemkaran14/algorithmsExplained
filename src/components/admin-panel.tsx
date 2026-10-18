'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
type Props = {
  users: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    emailVerified: boolean;
    providers: string[];
    allAccess: boolean;
    paymentCount: number;
    lessonCount: number;
  }[];
  payments: {
    id: string;
    receipt: string;
    amount: number;
    status: string;
    userId: string | null;
    paymentEmail: string | null;
    user: { name: string | null; email: string | null } | null;
  }[];
  coupons: {
    id: string;
    code: string;
    kind: string;
    value: number;
    usedCount: number;
    maxUses: number;
    active: boolean;
  }[];
};
export function AdminPanel({ users, payments, coupons }: Props) {
  const router = useRouter();
  const t = useTranslations('adminUsers');
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  async function send(path: string, body: unknown, method = 'POST') {
    setBusy(true);
    try {
      const response = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Request failed');
      setMessage('Saved.');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-10">
      <p role="status" className="text-sm">
        {message}
      </p>
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Create coupon</h2>
        <form
          className="grid gap-3 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!ready || busy) return;
            const data = new FormData(e.currentTarget);
            void send('/api/admin/coupons', {
              code: data.get('code'),
              kind: data.get('kind'),
              value: Number(data.get('value')),
              maxUses: Number(data.get('maxUses')),
              expiresAt: new Date(String(data.get('expiry'))).toISOString(),
            });
          }}
        >
          <label className="text-sm">
            Code
            <input
              disabled={!ready || busy}
              required
              name="code"
              minLength={3}
              maxLength={32}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            />
          </label>
          <label className="text-sm">
            Discount type
            <select
              disabled={!ready || busy}
              name="kind"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <option value="percent">Percentage</option>
              <option value="flat">Flat paise</option>
            </select>
          </label>
          <label className="text-sm">
            Value
            <input
              disabled={!ready || busy}
              required
              name="value"
              type="number"
              min="1"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            />
          </label>
          <label className="text-sm">
            Expiry
            <input
              disabled={!ready || busy}
              required
              name="expiry"
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            />
          </label>
          <label className="text-sm">
            Usage limit
            <input
              disabled={!ready || busy}
              required
              name="maxUses"
              type="number"
              min="1"
              max="100000"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            />
          </label>
          <Button disabled={!ready || busy} className="self-end">
            Create coupon
          </Button>
        </form>
        <p className="mt-3 text-xs text-[var(--muted)]">
          A coupon use is reserved when its order is created. Abandoned orders
          retain reservations to prevent overspending the usage limit.
        </p>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Disabling prevents new orders; existing payable orders keep their
          original price.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {coupons.map((c) => (
            <li key={c.id}>
              {c.code} · {c.value} {c.kind} · {c.usedCount}/{c.maxUses} used ·{' '}
              {c.active ? 'Active' : 'Disabled'}{' '}
              <Button
                variant="outline"
                disabled={!ready || busy}
                onClick={() =>
                  void send(
                    '/api/admin/coupons',
                    { id: c.id, active: !c.active },
                    'PATCH',
                  )
                }
              >
                {c.active ? 'Disable' : 'Enable'} {c.code}
              </Button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Payments · current page</h2>
        {!payments.length && <p>No payments match these filters.</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="p-3">Receipt</th>
                <th className="p-3">{t('accountEmail')}</th>
                <th className="p-3">{t('paymentEmail')}</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-[var(--border)]">
                  <td className="max-w-48 break-all p-3 font-mono text-xs">
                    {p.receipt}
                  </td>
                  <td className="p-3">
                    {p.userId ? (
                      <Link
                        className="underline"
                        href={`/admin/users/${p.userId}`}
                      >
                        {p.user?.email ?? p.userId}
                      </Link>
                    ) : (
                      t('deleted')
                    )}
                  </td>
                  <td className="p-3">{p.paymentEmail ?? t('notRecorded')}</td>
                  <td className="p-3">INR {(p.amount / 100).toFixed(2)}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3">
                    {p.status === 'paid' && (
                      <Button
                        disabled={!ready || busy}
                        variant="outline"
                        onClick={() => {
                          if (
                            window.confirm(
                              'Refund this entire payment through Razorpay? Access will be revoked when processing completes.',
                            )
                          )
                            void send('/api/admin/refunds', {
                              paymentId: p.id,
                            });
                        }}
                      >
                        Refund
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Accounts · current page</h2>
        {!users.length && <p>No accounts match these filters.</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {[
                  t('accountColumn'),
                  t('role'),
                  t('access'),
                  t('emailVerified'),
                  t('loginProviders'),
                  t('payments'),
                  t('started'),
                ].map((label) => (
                  <th key={label} className="p-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-[var(--border)]">
                  <td className="p-3">
                    <Link href={`/admin/users/${u.id}`} className="underline">
                      {u.name ?? t('unnamed')}
                      <span className="block">{u.email ?? t('noEmail')}</span>
                    </Link>
                  </td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">
                    {u.allAccess ? t('lifetime') : t('free')}
                  </td>
                  <td className="p-3">
                    {u.emailVerified ? t('yes') : t('notRecorded')}
                  </td>
                  <td className="p-3">
                    {u.providers.join(', ') || t('emailProvider')}
                  </td>
                  <td className="p-3">{u.paymentCount}</td>
                  <td className="p-3">{u.lessonCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
