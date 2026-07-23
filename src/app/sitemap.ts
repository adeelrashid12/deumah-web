import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/utils/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'ar'];
  const baseUrl = getBaseUrl();
  const paths = ['', '/listings', '/listings/1', '/listings/2', '/listings/3', '/listings/5'];
  
  const sitemapEntries: MetadataRoute.Sitemap = [];
  
  locales.forEach(locale => {
    paths.forEach(path => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: path === '' ? 1.0 : 0.8,
      });
    });
  });
  
  return sitemapEntries;
}
