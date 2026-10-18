import { LegalPage } from '@/components/legal-page';
import { pageMetadata } from '@/config/site';
export const metadata = pageMetadata(
  'About AlgoVerse',
  'Visual, interactive learning across algorithms, system design, databases and cloud.',
  '/about',
);
export default function Page() {
  return <LegalPage page="about" />;
}
