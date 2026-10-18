import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/config/site';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/account',
        '/admin',
        '/sign-in',
        '/checkout/',
        '/revision',
      ],
    },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
