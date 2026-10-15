'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
type Props = {
  users: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  }[];
  payments: {
    id: string;
    receipt: string;
    amount: number;
    status: string;
    userId: string | null;
  }[];
  coupons: {
    id: string;
    code: string;
    kind: string;
    value: number;
    usedCount: number;
    maxUses: number;
  }[];
};
export function AdminPanel({ users, payments, coupons }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  async function send(path: string, body: unknown) {
    setBusy(true);
    try {
      const response = await fetch(path, {
        method: 'POST',
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
              required
              name="expiry"
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            />
          </label>
          <label className="text-sm">
            Usage limit
            <input
              required
              name="maxUses"
              type="number"
              min="1"
              max="100000"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            />
          </label>
          <Button disabled={busy} className="self-end">
            Create coupon
          </Button>
        </form>
        <p className="mt-3 text-xs text-[var(--muted)]">
          A coupon use is reserved when its order is created. Abandoned orders
          retain reservations to prevent overspending the usage limit.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {coupons.map((c) => (
            <li key={c.id}>
              {c.code} · {c.value} {c.kind} · {c.usedCount}/{c.maxUses} used
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Recent payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="p-3">Receipt</th>
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
                  <td className="p-3">INR {(p.amount / 100).toFixed(2)}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3">
                    {p.status === 'paid' && (
                      <Button
                        disabled={busy}
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
        <h2 className="mb-4 text-2xl font-semibold">Accounts · first 50</h2>
        <ul className="space-y-3 text-sm">
          {users.map((u) => (
            <li
              key={u.id}
              className="rounded-lg border border-[var(--border)] p-3"
            >
              {u.name ?? u.email ?? u.id} · {u.role}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
