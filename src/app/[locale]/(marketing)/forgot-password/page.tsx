import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import ForgotPasswordContent from './forgot-password-content';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return {
    title: t('forgotPasswordTitle'),
    robots: { index: false, follow: false },
  };
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ForgotPasswordContent />;
}
