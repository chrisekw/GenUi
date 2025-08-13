
import type { MetadataRoute } from 'next';
import { getCommunityComponents } from '@/app/actions';

const BASE_URL = 'https://genoui.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes = [
    '',
    '/community',
    '/pricing',
    '/login',
    '/signup',
    '/my-components',
    '/settings',
    '/settings/profile',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic component pages
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const components = await getCommunityComponents();
    dynamicRoutes = components.map((component) => ({
      url: `${BASE_URL}/component/${component.id}`,
      lastModified: component.createdAt ? new Date(component.createdAt).toISOString() : new Date().toISOString(),
      changeFrequency: 'weekly' as 'weekly',
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Failed to fetch community components for sitemap:", error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
