import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { AdminPanel } from '@/components/admin-panel';
import {
  adminFilters,
  adminOverview,
  PAGE_SIZE,
  type AdminFilters,
} from '@/admin/overview';
export const metadata = {
  title: 'Administration',
  robots: { index: false, follow: false },
};
function Pager({
  name,
  page,
  count,
  filters,
}: {
  name: 'usersPage' | 'paymentsPage' | 'couponsPage';
  page: number;
  count: number;
  filters: AdminFilters;
}) {
  const link = (value: number) => {
    const params = new URLSearchParams(
      Object.entries({ ...filters, [name]: value }).map(([key, v]) => [
        key,
        String(v),
      ]),
    );
    return `/admin?${params}`;
  };
  return (
    <nav
      aria-label={`${name} pagination`}
      className="my-4 flex flex-wrap items-center gap-4 text-sm"
    >
      {page > 1 && (
        <Link href={link(page - 1)} className="underline">
          Previous
        </Link>
      )}
      <span>
        Page {page} · {count} matching records
      </span>
      {page * PAGE_SIZE < count && (
        <Link href={link(page + 1)} className="underline">
          Next
        </Link>
      )}
    </nav>
  );
}
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = (await auth())?.user;
  if (!user?.id) redirect('/sign-in');
  if (
    (
      await db.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      })
    )?.role !== 'admin'
  )
    notFound();
  const parsed = adminFilters.safeParse(await searchParams);
  if (!parsed.success)
    return (
      <section className="mx-auto max-w-3xl p-8">
        <h1 className="text-3xl">Invalid administration filters</h1>
        <p className="my-4">
          Use a supported status, a short search and positive page numbers.
        </p>
        <Link href="/admin" className="underline">
          Clear filters
        </Link>
      </section>
    );
  const filters = parsed.data,
    data = await adminOverview(filters);
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="mb-8 text-4xl font-semibold">Administration</h1>
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          [data.totalUsers, 'Accounts'],
          [
            `INR ${(data.capturedPaise / 100).toFixed(2)}`,
            'Active captured payments',
          ],
          [data.refunded, 'Refunded orders'],
          [data.paidUsers, 'Accounts with captured payments'],
        ].map(([value, label]) => (
          <div
            key={label}
            className="rounded-2xl border border-[var(--border)] p-5"
          >
            <p className="font-mono text-2xl">{value}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">{label}</p>
          </div>
        ))}
      </div>
      <form className="mb-8 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          Search names / email, receipts or coupons
          <input
            name="q"
            defaultValue={filters.q}
            maxLength={100}
            className="mt-2 block w-full rounded border border-[var(--border)] bg-[var(--background)] p-3"
          />
        </label>
        <label className="text-sm">
          Payment status
          <select
            name="status"
            defaultValue={filters.status}
            className="mt-2 block rounded border border-[var(--border)] bg-[var(--background)] p-3"
          >
            {[
              'all',
              'initializing',
              'created',
              'paid',
              'failed',
              'refund-pending',
              'refunded',
            ].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <button className="rounded-lg bg-lime-300 px-5 py-3 text-zinc-950">
          Apply filters
        </button>
      </form>
      <section className="mb-8 rounded-2xl border border-[var(--border)] p-5">
        <h2 className="text-xl font-semibold">Content free-ratio report</h2>
        <p className="my-3">
          {data.content.free}/{data.content.total} lessons free ·{' '}
          {data.content.ratio.toFixed(2)}% · global target 18–22%
        </p>
        <ul className="flex flex-wrap gap-5 text-sm">
          {data.content.tracks.map((x) => (
            <li key={x.track}>
              {x.track}: {x.free}/{x.total} free
            </li>
          ))}
        </ul>
      </section>
      <section className="mb-8 rounded-2xl border border-[var(--border)] p-5">
        <h2 className="text-xl font-semibold">Reported lesson completions</h2>
        <p className="my-3 text-sm text-[var(--muted)]">
          Learner-synced progress; certificates use server-graded quiz evidence
          separately.
        </p>
        <ol className="space-y-2 text-sm">
          {data.topLessons.map((x) => (
            <li key={x.slug}>
              {x.title}: {x.completions}
            </li>
          ))}
        </ol>
      </section>
      <AdminPanel
        users={data.users}
        payments={data.payments}
        coupons={data.coupons}
      />
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Browse result pages</h2>
        <h3 className="mt-4 font-medium">Accounts</h3>
        <Pager
          name="usersPage"
          page={filters.usersPage}
          count={data.userCount}
          filters={filters}
        />
        <h3 className="mt-4 font-medium">Payments</h3>
        <Pager
          name="paymentsPage"
          page={filters.paymentsPage}
          count={data.paymentCount}
          filters={filters}
        />
        <h3 className="mt-4 font-medium">Coupons</h3>
        <Pager
          name="couponsPage"
          page={filters.couponsPage}
          count={data.couponCount}
          filters={filters}
        />
      </section>
    </section>
  );
}
