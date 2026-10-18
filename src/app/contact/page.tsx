import { LegalPage } from '@/components/legal-page';
import { pageMetadata } from '@/config/site';
export const metadata = pageMetadata(
  'Contact & support',
  'Contact AlgoVerse about account access, payments, privacy and learning content.',
  '/contact',
);
export default function Page() {
  return <LegalPage page="contact" />;
}
