import { z } from 'zod';
import { api, json, readJson, requireSameOrigin, ApiError } from '@/lib/http';
import { requireAdmin } from '@/lib/user';
import { db } from '@/lib/db';
import { PRICING } from '@/config/pricing';
import { discountedAmount } from '@/payments/security';
const schema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,32}$/),
  kind: z.enum(['percent', 'flat']),
  value: z.number().int().positive(),
  expiresAt: z.iso.datetime(),
  maxUses: z.number().int().min(1).max(100000),
});
export async function POST(request: Request) {
  return api(async () => {
    requireSameOrigin(request);
    await requireAdmin();
    const input = schema.parse(await readJson(request));
    if (new Date(input.expiresAt) <= new Date())
      throw new ApiError(400, 'Coupon expiry must be in the future.');
    try {
      discountedAmount(PRICING.amountPaise, input);
    } catch {
      throw new ApiError(400, 'Coupon discount is invalid.');
    }
    if (await db.coupon.findUnique({ where: { code: input.code } }))
      throw new ApiError(409, 'This coupon code already exists.');
    const coupon = await db.coupon.create({
      data: { ...input, expiresAt: new Date(input.expiresAt) },
    });
    return json({ id: coupon.id, code: coupon.code }, 201);
  });
}
