'use client';

import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc/client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, TrendingUp, Shield, Clock, ArrowRight, Bell } from 'lucide-react';
import { RiskLevel } from '@prisma/client';

function getComplianceScoreColor(score: number | null) {
  if (score === null) return 'text-gray-500';
  if (score < 40) return 'text-red-600';
  if (score < 70) return 'text-yellow-600';
  return 'text-green-600';
}

function getRiskLevelColor(riskLevel: string) {
  switch (riskLevel) {
    case 'UNACCEPTABLE':
      return 'border-red-600 bg-red-50 text-red-700';
    case 'HIGH':
      return 'border-orange-600 bg-orange-50 text-orange-700';
    case 'LIMITED':
      return 'border-yellow-600 bg-yellow-50 text-yellow-700';
    case 'MINIMAL':
      return 'border-green-600 bg-green-50 text-green-700';
    default:
      return 'border-gray-300 bg-gray-50 text-gray-700';
  }
}

function getRiskLevelIcon(riskLevel: string) {
  switch (riskLevel) {
    case 'UNACCEPTABLE':
      return <AlertCircle className="h-6 w-6" />;
    case 'HIGH':
      return <AlertCircle className="h-6 w-6" />;
    case 'LIMITED':
      return <Clock className="h-6 w-6" />;
    case 'MINIMAL':
      return <CheckCircle2 className="h-6 w-6" />;
    default:
      return <Shield className="h-6 w-6" />;
  }
}

// Calculate days until EU AI Act deadline (August 2, 2026)
function getDaysUntilDeadline() {
  const deadline = new Date('2026-08-02');
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tClass = useTranslations('classification');
  const tCommon = useTranslations('common');
  const router = useRouter();

  // Fetch dashboard stats
  const { data: stats, isLoading } = trpc.system.getStats.useQuery();

  // Fetch critical gaps (top 5)
  const { data: systems } = trpc.system.list.useQuery({ limit: 50 });

  // Fetch latest regulatory updates
  const { data: latestUpdates } = trpc.intelligence.getLatest.useQuery({ limit: 3 });

  const daysUntilDeadline = getDaysUntilDeadline();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-medium">{tCommon('loading')}</div>
        </div>
      </div>
    );
  }

  const hasData = stats && stats.totalSystems > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Systems */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {t('totalSystems')}
              </div>
              <div className="mt-2 text-3xl font-bold">
                {stats?.totalSystems || 0}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {stats?.classifiedSystems || 0} {t('classified')}
              </div>
            </div>
            <Shield className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        {/* Compliance Score */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {t('complianceScore')}
              </div>
              <div
                className={`mt-2 text-3xl font-bold ${getComplianceScoreColor(stats?.avgComplianceScore || null)}`}
              >
                {stats?.avgComplianceScore !== null && stats?.avgComplianceScore !== undefined
                  ? `${stats.avgComplianceScore}%`
                  : '-'}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t('average')}
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          {stats?.avgComplianceScore !== null && stats?.avgComplianceScore !== undefined && (
            <Progress value={stats.avgComplianceScore} className="mt-3 h-2" />
          )}
        </Card>

        {/* Critical Gaps */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {t('criticalGaps')}
              </div>
              <div className={`mt-2 text-3xl font-bold ${stats?.criticalGaps && stats.criticalGaps > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats?.criticalGaps || 0}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t('requiresAttention')}
              </div>
            </div>
            <AlertCircle className={`h-8 w-8 ${stats?.criticalGaps && stats.criticalGaps > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
          </div>
        </Card>

        {/* Deadline Countdown */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {t('euAiActDeadline')}
              </div>
              <div className="mt-2 text-3xl font-bold">{daysUntilDeadline}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t('daysRemaining')}
              </div>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Risk Distribution */}
      {hasData && (
        <div>
          <h2 className="text-xl font-semibold">{t('riskDistribution')}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(['UNACCEPTABLE', 'HIGH', 'LIMITED', 'MINIMAL'] as const).map((riskLevel) => {
              const count = stats?.riskDistribution[riskLevel] || 0;
              return (
                <Card
                  key={riskLevel}
                  className={`border-2 p-4 ${getRiskLevelColor(riskLevel)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getRiskLevelIcon(riskLevel)}
                      <div>
                        <div className="text-sm font-medium">
                          {tClass(riskLevel.toLowerCase())}
                        </div>
                        <div className="text-2xl font-bold">{count}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Critical Gaps List */}
      {hasData && systems && systems.systems.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('topCriticalGaps')}</h2>
          </div>
          <div className="mt-4 space-y-3">
            {systems.systems
              .filter((s: any) => s.gaps.length > 0)
              .slice(0, 5)
              .flatMap((system: any) =>
                system.gaps
                  .filter((gap: any) => gap.priority === 'CRITICAL' && gap.status !== 'COMPLETED')
                  .slice(0, 1)
                  .map((gap: any) => ({
                    gap,
                    systemId: system.id,
                    systemName: system.name,
                  }))
              )
              .slice(0, 5)
              .map(({ gap, systemId, systemName }: any) => (
                <Card key={gap.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium">{gap.article}</span>
                        <Badge variant="destructive">{gap.priority}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {gap.requirement}
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {t('system')}: {systemName}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/systems/${systemId}/gaps`)
                      }
                    >
                      {t('viewGaps')}
                      <ArrowRight className="ms-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            {systems.systems.filter((s: any) => s.gaps.length > 0).length === 0 && (
              <Card className="p-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
                <div className="mt-4 text-lg font-medium">{t('noCriticalGaps')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('noCriticalGapsDescription')}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Latest Regulatory Updates */}
      {latestUpdates && latestUpdates.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('latestUpdates')}</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/intelligence">
                {t('viewAll')}
                <ArrowRight className="ms-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {latestUpdates.map((update) => (
              <Card key={update.id} className={`p-4 ${!update.isRead ? 'border-primary/50 bg-primary/5' : ''}`}>
                <div className="flex items-start gap-3">
                  {!update.isRead && (
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {update.regulation.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Link
                      href="/intelligence"
                      className="font-medium hover:underline line-clamp-1"
                    >
                      {update.title}
                    </Link>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(update.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Bell className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasData && (
        <Card className="p-8 text-center">
          <Shield className="mx-auto h-16 w-16 text-muted-foreground" />
          <div className="mt-4 text-lg font-medium">{t('noSystems')}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {t('noSystemsDescription')}
          </div>
          <Button
            className="mt-4"
            onClick={() => router.push('/systems/new')}
          >
            {t('addFirstSystem')}
          </Button>
        </Card>
      )}
    </div>
  );
}
