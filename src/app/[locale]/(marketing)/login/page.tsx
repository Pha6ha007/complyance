import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LoginForm } from './login-form';

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
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#0F172A] px-4 py-16 overflow-hidden">
      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          animation: 'gridShift 20s linear infinite',
        }}
      />
      {/* Orbs */}
      <div className="absolute top-0 start-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 end-1/4 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-[80px] pointer-events-none" />

      <LoginForm locale={locale} />
    </div>
  );
}
