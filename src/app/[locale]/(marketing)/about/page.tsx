import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import AboutContent from './about-content';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://complyance.io';

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return {
    title: t('title'),
    description: t('subtitle'),
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      url: `${baseUrl}/${locale}/about`,
      images: [
        {
          url: `${baseUrl}/api/og?title=${encodeURIComponent(t('title'))}&description=${encodeURIComponent(t('subtitle'))}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutContent />;
}
