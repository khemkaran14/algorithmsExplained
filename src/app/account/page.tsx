import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { SignOutButton } from '@/components/sign-out-button';
import { LearningDashboard } from '@/components/learning-dashboard';
export default async function Account() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-4xl font-semibold">Your account</h1>
      <p className="my-5 text-[var(--muted)]">
        {session.user.name ?? session.user.email}
      </p>
      <div className="mb-8">
        <SignOutButton />
      </div>
      <LearningDashboard signedIn />
    </section>
  );
}
