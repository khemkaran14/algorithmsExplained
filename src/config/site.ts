import type { Metadata } from 'next';
import { PRODUCT } from './product';
/** Never derive canonical URLs from an untrusted request Host header. */
export function siteOrigin() {
  const value =
    process.env.SITE_URL ||
    'https://learndatastructureandalgorithms.divyrs.com';
  const url = new URL(value);
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  )
    throw new Error('SITE_URL must be a public HTTP(S) origin.');
  return url.origin;
}
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: PRODUCT.name,
      type: 'website',
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: PRODUCT.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
  };
}
