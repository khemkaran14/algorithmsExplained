import type { LessonMeta } from './types';
import { lessonUrl } from './catalog';

/**
 * Schema.org data for a lesson page: a breadcrumb trail (Google can show it
 * in search results) and a LearningResource. Built only from public catalog
 * metadata, never from lesson content.
 */
export function lessonStructuredData(meta: LessonMeta, origin: string) {
  const learn = `${origin}/learn`;
  const track = `${learn}/${meta.track}`;
  const mod = `${track}/${meta.module}`;
  const url = `${origin}${lessonUrl(meta)}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Learn', item: learn },
        {
          '@type': 'ListItem',
          position: 2,
          name: meta.track.toUpperCase(),
          item: track,
        },
        { '@type': 'ListItem', position: 3, name: meta.module, item: mod },
        { '@type': 'ListItem', position: 4, name: meta.title, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: meta.title,
      description: meta.description,
      url,
      inLanguage: 'en',
      learningResourceType: 'Interactive lesson',
      educationalLevel: meta.level,
      timeRequired: `PT${meta.estimatedMinutes}M`,
      isAccessibleForFree: meta.isFree,
      keywords: meta.tags.join(', '),
    },
  ];
}

/** Safe to place inside a <script> tag. */
export function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
