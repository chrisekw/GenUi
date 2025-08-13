
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://genoui.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/payment/', '/settings/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
