import { getTranslations } from 'next-intl/server';
import { BiasTestingClient } from './client';

export async function generateMetadata() {
  const t = await getTranslations('bias');
  return {
    title: t('title'),
  };
}

export default async function BiasTestingPage() {
  const t = await getTranslations('bias');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <p className="mt-1 text-sm text-slate-400">{t('subtitle')}</p>
      </div>
      <BiasTestingClient />
    </div>
  );
}
