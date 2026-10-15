import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PaymentConfirmation } from '@/components/payment-confirmation';
export default async function Success() {
  if (!(await auth())?.user) redirect('/sign-in');
  return (
    <section className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="mb-8 text-4xl font-semibold">
        Let’s confirm your access.
      </h1>
      <PaymentConfirmation />
    </section>
  );
}
