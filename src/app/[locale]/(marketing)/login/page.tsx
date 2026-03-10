import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LoginForm } from './login-form';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return {
    title: `${t('login')} — Complyance`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4">
      {/* Language switcher in top right corner */}
      <div className="absolute top-4 end-4">
        <LocaleSwitcher />
      </div>

      <LoginForm locale={locale} />
    </div>
  );
}
