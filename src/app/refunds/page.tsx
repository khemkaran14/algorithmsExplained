import { LegalPage } from '@/components/legal-page';
import { pageMetadata } from '@/config/site';
export const metadata = pageMetadata(
  'Refund & cancellation policy',
  'How to request a refund for digital access and what happens after an approved refund.',
  '/refunds',
);
export default function Page() {
  return <LegalPage page="refunds" />;
}
