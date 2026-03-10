import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ReferralsClient } from './referrals-client';

interface ReferralsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ReferralsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'referrals' });

  return {
    title: `${t('title')} — Complyance`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ReferralsPage({ params }: ReferralsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ReferralsClient />;
}
