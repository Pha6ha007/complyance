import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://complyance.io';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/en/',
          '/fr/',
          '/de/',
          '/pt/',
          '/ar/',
          '/pl/',
          '/it/',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/systems/',
          '/vendors/',
          '/evidence/',
          '/intelligence/',
          '/settings/',
          '/admin/',
          '/_next/',
          '/verify/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/en/',
          '/fr/',
          '/de/',
          '/pt/',
          '/ar/',
          '/pl/',
          '/it/',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/systems/',
          '/vendors/',
          '/evidence/',
          '/intelligence/',
          '/settings/',
          '/admin/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
