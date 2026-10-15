'use client';
import { signOut } from 'next-auth/react';
import { writeLearning } from '@/learning/local';
import { EMPTY } from '@/learning/progress';
import { Button } from './ui/button';
export function SignOutButton() {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        writeLearning(EMPTY);
        try {
          localStorage.removeItem('algoverse.reviews.v1');
        } catch {}
        await signOut({ redirectTo: '/' });
      }}
    >
      Sign out
    </Button>
  );
}
