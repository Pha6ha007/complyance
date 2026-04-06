import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ManagedContent } from './managed-content';

interface ManagedPageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://complyance.app';

export async function generateMetadata({ params }: ManagedPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'managed.meta' });

  const title = t('title');
  const description = t('description');
  const ogTitle = t('ogTitle');
  const ogDescription = t('ogDescription');

  const canonicalUrl = `${baseUrl}/${locale}/managed`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale,
      url: canonicalUrl,
      siteName: 'Complyance',
      images: [
        {
          url: `${baseUrl}/api/og?title=${encodeURIComponent(ogTitle)}&description=${encodeURIComponent(ogDescription)}`,
          width: 1200,
          height: 630,
          alt: 'Complyance Managed Service',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ManagedPage({ params }: ManagedPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ManagedContent />;
}
