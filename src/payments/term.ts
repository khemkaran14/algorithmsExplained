import { PRICING } from '@/config/pricing';
/** Calendar-year term in UTC, clamping leap-day anniversaries to February 28. */
export function accessExpiry(start: Date): Date {
  const end = new Date(start);
  const month = start.getUTCMonth();
  end.setUTCFullYear(start.getUTCFullYear() + PRICING.accessYears);
  if (end.getUTCMonth() !== month) end.setUTCDate(0);
  return end;
}
export function activeAccess(userId?: string, now = new Date()) {
  return {
    ...(userId !== undefined ? { userId } : {}),
    type: 'ALL_ACCESS',
    revokedAt: null,
    expiresAt: { gt: now },
  };
}
