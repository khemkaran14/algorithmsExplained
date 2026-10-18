import { LegalPage } from '@/components/legal-page';
import { pageMetadata } from '@/config/site';
export const metadata = pageMetadata(
  'Digital delivery policy',
  'How AlgoVerse delivers online access after payment confirmation.',
  '/shipping',
);
export default function Page() {
  return <LegalPage page="shipping" />;
}
