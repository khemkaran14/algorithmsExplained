import { auth } from '@/auth';
import { hasAllAccess } from '@/payments/access';
import type { LessonMeta } from '@/content/catalog';
import { CatalogGrid } from './catalog-grid';

export async function AuthorizedCatalogGrid({
  lessons,
}: {
  lessons: readonly LessonMeta[];
}) {
  const session = await auth();
  const allAccess = Boolean(
    session?.user?.id && (await hasAllAccess(session.user.id)),
  );
  return <CatalogGrid lessons={lessons} allAccess={allAccess} />;
}
