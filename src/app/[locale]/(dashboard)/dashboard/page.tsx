import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('dashboard');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('welcome')}</p>
      </div>

      {/* Stats Grid - will be populated with real data later */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">
            {t('systemsOverview')}
          </div>
          <div className="mt-2 text-3xl font-bold">0</div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">
            {t('complianceScore')}
          </div>
          <div className="mt-2 text-3xl font-bold">-</div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">
            {t('criticalGaps')}
          </div>
          <div className="mt-2 text-3xl font-bold">0</div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">
            {t('deadlineCountdown')}
          </div>
          <div className="mt-2 text-3xl font-bold">511</div>
        </div>
      </div>

      {/* Coming soon message */}
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">
          Dashboard statistics will appear here once you add your first AI system.
        </p>
      </div>
    </div>
  );
}
