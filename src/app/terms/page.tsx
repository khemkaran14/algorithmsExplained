import { LegalPage } from '@/components/legal-page';
import { pageMetadata } from '@/config/site';
export const metadata = pageMetadata(
  'Terms of service',
  'Account rules, five-year access terms, payment conditions and educational-use terms for AlgoVerse.',
  '/terms',
);
export default function Page() {
  return <LegalPage page="terms" />;
}
