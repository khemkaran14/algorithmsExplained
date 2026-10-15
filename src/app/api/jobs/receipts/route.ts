import { timingSafeEqual } from 'node:crypto';
import { api, json, ApiError } from '@/lib/http';
import { dispatchReceipts } from '@/payments/receipts';
export async function POST(request: Request) {
  return api(async () => {
    const secret = process.env.JOBS_SECRET;
    if (!secret)
      throw new ApiError(503, 'Job authentication is not configured.');
    const provided = Buffer.from(request.headers.get('authorization') ?? '');
    const expected = Buffer.from(`Bearer ${secret}`);
    if (
      provided.length !== expected.length ||
      !timingSafeEqual(provided, expected)
    )
      throw new ApiError(401, 'Job authentication failed.');
    return json(await dispatchReceipts());
  });
}
