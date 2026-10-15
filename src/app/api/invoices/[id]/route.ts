import { PDFDocument, StandardFonts } from 'pdf-lib';
import { api, ApiError } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { db } from '@/lib/db';
import { PRODUCT } from '@/config/product';
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return api(async () => {
    const user = await requireUser();
    const { id } = await params;
    const p = await db.payment.findFirst({
      where: {
        id,
        userId: user.id,
        status: { in: ['paid', 'refund-pending', 'refunded'] },
      },
    });
    if (!p) throw new ApiError(404, 'Invoice not found.');
    const pdf = await PDFDocument.create(),
      page = pdf.addPage([595, 842]),
      font = await pdf.embedFont(StandardFonts.Helvetica);
    const gstRate = Number(process.env.BUSINESS_GST_RATE ?? '0');
    if (!Number.isFinite(gstRate) || gstRate < 0 || gstRate > 28)
      throw new ApiError(503, 'Invoice tax configuration is invalid.');
    const tax = Math.round(p.amount - p.amount / (1 + gstRate / 100));
    const lines = [
      process.env.BUSINESS_NAME ?? PRODUCT.name,
      'Digital learning access - invoice',
      `Invoice: ${p.receipt}`,
      `Date: ${(p.paidAt ?? p.createdAt).toISOString().slice(0, 10)}`,
      `Customer: ${user.email ?? user.id}`,
      `Item: ${PRODUCT.name} lifetime ALL ACCESS`,
      `Currency: ${p.currency}`,
      `Total paid: INR ${(p.amount / 100).toFixed(2)}`,
      `Tax included (${gstRate}%): INR ${(tax / 100).toFixed(2)}`,
      `Net amount: INR ${((p.amount - tax) / 100).toFixed(2)}`,
      `GSTIN: ${process.env.BUSINESS_GSTIN ?? 'Not registered / not applicable'}`,
      `Payment ID: ${p.razorpayPaymentId ?? 'Pending'}`,
      `Status: ${p.status}`,
    ];
    lines.forEach((line, i) =>
      page.drawText(line.replace(/[^ -~]/g, '?').slice(0, 105), {
        x: 45,
        y: 780 - i * 30,
        size: i === 0 ? 20 : 11,
        font,
      }),
    );
    return new Response(Buffer.from(await pdf.save()), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${p.receipt}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  });
}
