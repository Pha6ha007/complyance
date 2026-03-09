'use client';

import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ClassificationWizard } from '@/components/systems/classification-wizard';
import { ArrowLeft } from 'lucide-react';

export default function NewSystemPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const tWizard = useTranslations('systems.wizard');
  const tSystems = useTranslations('systems');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/${locale}/systems`)}
        >
          <ArrowLeft className="me-2 h-4 w-4" />
          {tSystems('backToSystems')}
        </Button>

        <h1 className="mt-4 text-3xl font-bold">{tWizard('title')}</h1>
        <p className="mt-1 text-muted-foreground">{tWizard('subtitle')}</p>
      </div>

      {/* Wizard */}
      <ClassificationWizard />
    </div>
  );
}
