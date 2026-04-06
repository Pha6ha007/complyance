import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BundleContent } from './bundle-content';

interface BundlePageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://complyance.app';

export async function generateMetadata({ params }: BundlePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'bundle.meta' });

  const title = t('title');
  const description = t('description');
  const canonicalUrl = `${baseUrl}/${locale}/bundle`;

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
          url: `${baseUrl}/api/og?title=${encodeURIComponent('Bundle: Complyance + TraceHawk')}&description=${encodeURIComponent('Save 25% on the AI lifecycle platform.')}`,
          width: 1200,
          height: 630,
          alt: 'Complyance + TraceHawk bundle',
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

export default async function BundlePage({ params }: BundlePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BundleContent />;
}
