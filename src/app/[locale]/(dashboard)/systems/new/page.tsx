'use client';

import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ClassificationWizard } from '@/components/systems/classification-wizard';
import { ArrowLeft } from 'lucide-react';

export default function NewSystemPage() {
  const router = useRouter();
  const tWizard = useTranslations('systems.wizard');
  const tSystems = useTranslations('systems');

  return (
    <div className="min-h-full p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/systems')}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {tSystems('backToSystems')}
        </button>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{tWizard('title')}</h1>
            <p className="mt-1 text-slate-400 text-sm">{tWizard('subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Wizard */}
      <ClassificationWizard />
    </div>
  );
}
