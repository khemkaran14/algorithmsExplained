'use client';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { writeLearning } from '@/learning/local';
import { clearLearningIdentity } from '@/learning/identity';
import { EMPTY } from '@/learning/progress';
export function AccountPrivacy() {
  const [confirmation, setConfirmation] = useState(''),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  return (
    <section className="my-10 rounded-2xl border border-[var(--border)] p-5">
      <h2 className="text-xl font-semibold">Your data</h2>
      <p className="my-4 text-sm text-[var(--muted)]">
        Download your profile, learning data and purchase summary. Sign-in
        credentials and session tokens are excluded.
      </p>
      <a
        href="/api/account/export"
        className="inline-block rounded-lg border border-[var(--border)] px-4 py-3 text-sm underline"
      >
        Download account data
      </a>
      <form
        className="mt-8 max-w-xl"
        onSubmit={async (event) => {
          event.preventDefault();
          if (confirmation !== 'DELETE MY ACCOUNT' || busy) return;
          setBusy(true);
          setMessage('');
          try {
            const response = await fetch('/api/account', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ confirmation }),
            });
            if (!response.ok) {
              const data = (await response.json()) as { error?: string };
              throw new Error(data.error ?? 'Account deletion failed.');
            }
            clearLearningIdentity();
            writeLearning(EMPTY);
            try {
              localStorage.removeItem('algoverse.reviews.v1');
            } catch {}
            try {
              await signOut({ redirect: false });
            } finally {
              window.location.assign('/');
            }
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : 'Account deletion failed.',
            );
            setBusy(false);
          }
        }}
      >
        <h3 className="font-semibold">Delete your account</h3>
        <p className="my-3 text-sm text-[var(--muted)]">
          This permanently removes your profile, sign-ins and learning data and
          revokes access. Payment records remain without your account link for
          accounting and payment reconciliation. Download your data and invoices
          first. Account deletion does not issue a refund.
        </p>
        <label className="block text-sm">
          Type DELETE MY ACCOUNT
          <input
            autoComplete="off"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="my-3 block w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
          />
        </label>
        <Button
          variant="outline"
          disabled={busy || confirmation !== 'DELETE MY ACCOUNT'}
        >
          {busy ? 'Deleting…' : 'Permanently delete account'}
        </Button>
        <p role="status" className="mt-3 text-sm">
          {message}
        </p>
      </form>
    </section>
  );
}
