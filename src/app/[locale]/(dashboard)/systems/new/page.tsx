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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/systems')}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {tSystems('backToSystems')}
        </button>

        <h1 className="mt-4 text-2xl font-bold text-white">{tWizard('title')}</h1>
        <p className="mt-1 text-slate-400">{tWizard('subtitle')}</p>
      </div>

      {/* Wizard */}
      <ClassificationWizard />
    </div>
  );
}
