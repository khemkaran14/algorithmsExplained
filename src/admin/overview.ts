import 'server-only';
import { z } from 'zod';
import { db } from '@/lib/db';
import { catalog } from '@/content/catalog';
const page = z.coerce.number().int().min(1).max(100000).default(1);
export const adminFilters = z
  .object({
    usersPage: page,
    paymentsPage: page,
    couponsPage: page,
    q: z.string().trim().max(100).default(''),
    status: z
      .enum([
        'all',
        'initializing',
        'created',
        'paid',
        'failed',
        'refund-pending',
        'refunded',
      ])
      .default('all'),
  })
  .strict();
export type AdminFilters = z.infer<typeof adminFilters>;
export const PAGE_SIZE = 25;
/** This module is internal; the page must freshly authorize the administrator first. */
export async function adminOverview(filters: AdminFilters) {
  const search = filters.q;
  const usersWhere = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};
  const paymentsWhere = {
    ...(filters.status === 'all' ? {} : { status: filters.status }),
    ...(search
      ? { receipt: { contains: search, mode: 'insensitive' as const } }
      : {}),
  };
  const couponsWhere = search
    ? { code: { contains: search, mode: 'insensitive' as const } }
    : {};
  const [
    users,
    payments,
    coupons,
    userCount,
    paymentCount,
    couponCount,
    totalUsers,
    captured,
    refunded,
    paidUsers,
    topLessons,
  ] = await Promise.all([
    db.user.findMany({
      where: usersWhere,
      skip: (filters.usersPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { id: 'asc' },
      select: { id: true, name: true, email: true, role: true },
    }),
    db.payment.findMany({
      where: paymentsWhere,
      skip: (filters.paymentsPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      select: {
        id: true,
        receipt: true,
        amount: true,
        status: true,
        userId: true,
      },
    }),
    db.coupon.findMany({
      where: couponsWhere,
      skip: (filters.couponsPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: [{ expiresAt: 'desc' }, { id: 'asc' }],
      select: {
        id: true,
        code: true,
        kind: true,
        value: true,
        usedCount: true,
        maxUses: true,
        active: true,
      },
    }),
    db.user.count({ where: usersWhere }),
    db.payment.count({ where: paymentsWhere }),
    db.coupon.count({ where: couponsWhere }),
    db.user.count(),
    db.payment.aggregate({
      where: { status: { in: ['paid', 'refund-pending'] } },
      _sum: { amount: true },
    }),
    db.payment.count({ where: { status: 'refunded' } }),
    db.$queryRaw<
      { count: bigint }[]
    >`SELECT COUNT(DISTINCT "userId") AS count FROM "Payment" WHERE status IN ('paid', 'refund-pending') AND "userId" IS NOT NULL`,
    db.lessonProgress.groupBy({
      by: ['lessonSlug'],
      where: { status: 'completed' },
      _count: { lessonSlug: true },
      orderBy: { _count: { lessonSlug: 'desc' } },
      take: 10,
    }),
  ]);
  const free = catalog.filter((x) => x.isFree).length;
  return {
    users,
    payments,
    coupons,
    userCount,
    paymentCount,
    couponCount,
    totalUsers,
    capturedPaise: captured._sum.amount ?? 0,
    refunded,
    paidUsers: Number(paidUsers[0]?.count ?? 0),
    topLessons: topLessons.map((x) => ({
      slug: x.lessonSlug,
      title:
        catalog.find((l) => l.slug === x.lessonSlug)?.title ?? 'Unknown lesson',
      completions: x._count.lessonSlug,
    })),
    content: {
      free,
      total: catalog.length,
      ratio: (free / catalog.length) * 100,
      tracks: [...new Set(catalog.map((l) => l.track))].map((track) => ({
        track,
        total: catalog.filter((l) => l.track === track).length,
        free: catalog.filter((l) => l.track === track && l.isFree).length,
      })),
    },
  };
}
