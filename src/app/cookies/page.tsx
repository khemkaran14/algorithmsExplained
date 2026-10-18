import { LegalPage } from '@/components/legal-page';
import { pageMetadata } from '@/config/site';
export const metadata = pageMetadata(
  'Cookie policy',
  'Essential authentication cookies, local learning storage and your browser controls.',
  '/cookies',
);
export default function Page() {
  return <LegalPage page="cookies" />;
}
