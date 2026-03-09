import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://complyance.io';
  const locales = ['en', 'fr', 'de', 'pt', 'ar', 'pl', 'it'];

  // Marketing pages that should be indexed
  const marketingPages = [
    '', // Home
    'pricing',
    'about',
    'contact',
    'partners',
    'privacy',
    'terms',
    'refund',
    'blog',
    'free-classifier',
  ];

  const sitemap: MetadataRoute.Sitemap = [];

  // Add marketing pages for each locale
  for (const locale of locales) {
    for (const page of marketingPages) {
      const path = page ? `/${locale}/${page}` : `/${locale}`;
      sitemap.push({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: page === '' || page === 'pricing' ? 'weekly' : 'monthly',
        priority: page === '' ? 1.0 : page === 'pricing' || page === 'free-classifier' ? 0.9 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [
              loc,
              `${baseUrl}${page ? `/${loc}/${page}` : `/${loc}`}`,
            ])
          ),
        },
      });
    }

    // Add blog posts for each locale
    const posts = getAllPosts(locale);
    posts.forEach((post) => {
      sitemap.push({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.frontmatter.date),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [loc, `${baseUrl}/${loc}/blog/${post.slug}`])
          ),
        },
      });
    });
  }

  return sitemap;
}
