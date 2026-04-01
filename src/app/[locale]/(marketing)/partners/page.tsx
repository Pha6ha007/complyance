import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import PartnersContent from './partners-content';

interface PartnersPageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://complyance.app';

export async function generateMetadata({ params }: PartnersPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'partners' });

  return {
    title: t('title'),
    description: t('subtitle'),
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      url: `${baseUrl}/${locale}/partners`,
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

export default async function PartnersPage({ params }: PartnersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PartnersContent />;
}
