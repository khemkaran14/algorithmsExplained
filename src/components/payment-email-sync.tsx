'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from './ui/button';

export function PaymentEmailSync({ paymentId }: { paymentId: string }) {
  const t = useTranslations('adminUsers');
  const router = useRouter();
  const [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  useEffect(() => setReady(true), []);
  return (
    <div className="mt-4">
      <Button
        variant="outline"
        disabled={!ready || busy}
        onClick={async () => {
          setBusy(true);
          setMessage('');
          try {
            const response = await fetch('/api/admin/payments/email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            if (!response.ok) throw new Error('Lookup failed.');
            const data = (await response.json()) as { recorded?: boolean };
            setMessage(data.recorded ? t('emailSaved') : t('emailUnavailable'));
            if (data.recorded) router.refresh();
          } catch {
            setMessage(t('emailLookupFailed'));
          } finally {
            setBusy(false);
          }
        }}
      >
        {t('fetchEmail')}
      </Button>
      <p role="status" className="mt-2 text-sm">
        {message}
      </p>
    </div>
  );
}
