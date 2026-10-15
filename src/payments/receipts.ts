import 'server-only';
import { PRODUCT } from '@/config/product';
import { db } from '@/lib/db';
export async function dispatchReceipts() {
  if (!process.env.AUTH_RESEND_KEY || !process.env.AUTH_EMAIL_FROM)
    return { sent: 0, configured: false };
  const candidates = await db.emailReceipt.findMany({
    where: {
      sentAt: null,
      attempts: { lt: 10 },
      nextAttemptAt: { lte: new Date() },
    },
    take: 10,
    include: { payment: { include: { user: { select: { email: true } } } } },
  });
  let sent = 0;
  for (const row of candidates) {
    const email = row.payment.user?.email;
    if (!email || !['paid', 'refund-pending'].includes(row.payment.status))
      continue;
    const claimed = await db.emailReceipt.updateMany({
      where: { id: row.id, sentAt: null, nextAttemptAt: { lte: new Date() } },
      data: {
        attempts: { increment: 1 },
        nextAttemptAt: new Date(Date.now() + 300000),
      },
    });
    if (!claimed.count) continue;
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `receipt-${row.paymentId}`,
        },
        body: JSON.stringify({
          from: process.env.AUTH_EMAIL_FROM,
          to: email,
          subject: `Your ${PRODUCT.name} lifetime access receipt`,
          text: `Payment received: INR ${(row.payment.amount / 100).toFixed(2)}. Receipt: ${row.payment.receipt}. Your lifetime access is active. Download your invoice from your account.`,
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error('Email delivery failed');
      await db.emailReceipt.update({
        where: { id: row.id },
        data: { sentAt: new Date() },
      });
      sent++;
    } catch {
      await db.emailReceipt.update({
        where: { id: row.id },
        data: {
          nextAttemptAt: new Date(
            Date.now() + Math.min(86400000, 60000 * 2 ** row.attempts),
          ),
        },
      });
    }
  }
  return { sent, configured: true };
}
