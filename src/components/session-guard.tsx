'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { learningOwner, verifyLearningIdentity } from '@/learning/identity';

export function SessionGuard() {
  const router = useRouter();
  const previous = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        void verifyLearningIdentity().then((verified) => {
          if (!verified) return;
          const owner = learningOwner();
          if (previous.current !== undefined && previous.current !== owner)
            router.refresh();
          previous.current = owner;
        });
      }
    };
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    document.addEventListener('visibilitychange', refresh);
    const timer = window.setInterval(refresh, 60000);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.clearInterval(timer);
    };
  }, [router]);
  return null;
}
