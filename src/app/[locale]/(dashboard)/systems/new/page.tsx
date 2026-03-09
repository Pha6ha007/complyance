'use client';

import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewSystemPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('systems');

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
          {t('backToSystems')}
        </Button>

        <h1 className="mt-4 text-3xl font-bold">Add New AI System</h1>
        <p className="mt-1 text-muted-foreground">
          Create a new AI system entry for compliance tracking
        </p>
      </div>

      {/* Coming soon placeholder */}
      <div className="rounded-lg border p-12 text-center">
        <h3 className="text-lg font-semibold">AI System Wizard Coming Soon</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The 5-step AI system classification wizard will be available here.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          This will guide you through system details, use case, data processing,
          markets, and risk classification.
        </p>
      </div>
    </div>
  );
}
