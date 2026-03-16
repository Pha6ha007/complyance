import { getTranslations } from 'next-intl/server';
import { SDKClient } from './client';

export async function generateMetadata() {
  const t = await getTranslations('sdk');
  return {
    title: t('title'),
  };
}

export default async function SDKPage() {
  const t = await getTranslations('sdk');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <p className="mt-1 text-sm text-slate-400">{t('subtitle')}</p>
      </div>
      <SDKClient />
    </div>
  );
}
