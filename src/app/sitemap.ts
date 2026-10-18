import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/config/site';
import { catalog, lessonUrl } from '@/content/catalog';
export default function sitemap(): MetadataRoute.Sitemap {
  const lessons = catalog.filter((l) => l.status !== 'planned');
  const paths = new Set([
    '/',
    '/learn',
    '/pricing',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/refunds',
    '/shipping',
    '/cookies',
    '/playground',
    '/compare',
    '/cheatsheet',
    ...[
      'dsa-interviews',
      'system-design-interviews',
      'database-fundamentals',
      'cloud-practitioner',
    ].map((p) => `/paths/${p}`),
  ]);
  for (const lesson of lessons) {
    paths.add(`/learn/${lesson.track}`);
    paths.add(`/learn/${lesson.track}/${lesson.module}`);
    paths.add(lessonUrl(lesson));
  }
  return [...paths].map((path) => ({ url: `${siteOrigin()}${path}` }));
}
