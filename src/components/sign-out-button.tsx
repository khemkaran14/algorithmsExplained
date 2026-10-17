'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import { writeLearning } from '@/learning/local';
import { clearLearningIdentity } from '@/learning/identity';
import { EMPTY } from '@/learning/progress';
import { Button } from './ui/button';
export function SignOutButton() {
  const t = useTranslations('auth');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <div>
      <Button
        variant="outline"
        disabled={!ready || busy}
        onClick={async () => {
          setBusy(true);
          setFailed(false);
          clearLearningIdentity();
          writeLearning(EMPTY);
          try {
            localStorage.removeItem('algoverse.reviews.v1');
          } catch {}
          try {
            await signOut({ redirect: false });
            const response = await fetch('/api/session-state', {
              cache: 'no-store',
            });
            if (!response.ok) throw new Error('Session verification failed.');
            const state: unknown = await response.json();
            if (
              !state ||
              typeof state !== 'object' ||
              !('owner' in state) ||
              state.owner !== null
            )
              throw new Error('Session remains active.');
            window.location.assign('/');
          } catch {
            setFailed(true);
            setBusy(false);
          }
        }}
      >
        {t('signOut')}
      </Button>
      {failed && <p role="alert">{t('signOutError')}</p>}
    </div>
  );
}
