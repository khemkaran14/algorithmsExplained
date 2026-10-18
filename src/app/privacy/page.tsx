import { LegalPage } from '@/components/legal-page';
import { pageMetadata } from '@/config/site';
export const metadata = pageMetadata(
  'Privacy policy',
  'How AlgoVerse uses account, learning and payment information, and how to export or delete your data.',
  '/privacy',
);
export default function Page() {
  return <LegalPage page="privacy" />;
}
