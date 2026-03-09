import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';

export default function HomePage() {
  const t = useTranslations('marketing');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="absolute top-4 end-4">
        <LocaleSwitcher />
      </div>

      <main className="text-center">
        <h1 className="mb-4 text-5xl font-bold text-slate-900">
          Complyance
        </h1>
        <p className="mb-8 text-xl text-slate-600">
          {t('tagline')}
        </p>
        <button className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 transition">
          {t('cta')}
        </button>
      </main>

      <footer className="absolute bottom-4 text-sm text-slate-500">
        Phase 1: Foundation — Next.js 14 + TypeScript + Prisma + next-intl + NextAuth.js
      </footer>
    </div>
  );
}
