'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { RiskLevel } from '@prisma/client';
import { format } from 'date-fns';

function getRiskBadgeVariant(riskLevel: RiskLevel | null) {
  if (!riskLevel) return 'outline';

  switch (riskLevel) {
    case 'UNACCEPTABLE':
      return 'destructive';
    case 'HIGH':
      return 'destructive';
    case 'LIMITED':
      return 'default';
    case 'MINIMAL':
      return 'secondary';
    default:
      return 'outline';
  }
}

export default function SystemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const systemId = params.id as string;

  const t = useTranslations('systems');
  const tClass = useTranslations('classification');
  const tCommon = useTranslations('common');

  // Fetch system
  const { data: system, isLoading, error } = trpc.system.getById.useQuery({
    id: systemId,
  });

  // Delete mutation
  const deleteMutation = trpc.system.delete.useMutation({
    onSuccess: () => {
      router.push(`/${locale}/systems`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-medium">{tCommon('loading')}</div>
        </div>
      </div>
    );
  }

  if (error || !system) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <div className="mt-4 text-lg font-medium">{tCommon('error')}</div>
          <div className="text-sm text-muted-foreground">
            {error?.message || t('systemNotFound')}
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(`/${locale}/systems`)}
          >
            <ArrowLeft className="me-2 h-4 w-4" />
            {t('backToSystems')}
          </Button>
        </div>
      </div>
    );
  }

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

        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{system.name}</h1>
            <p className="mt-1 text-muted-foreground">{system.description}</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="me-2 h-4 w-4" />
              {tCommon('edit')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm(t('deleteConfirm'))) {
                  deleteMutation.mutate({ id: systemId });
                }
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="me-2 h-4 w-4" />
              {tCommon('delete')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main info grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic information */}
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">{t('basicInformation')}</h2>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('aiType')}
              </dt>
              <dd className="mt-1">{system.aiType}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('domain')}
              </dt>
              <dd className="mt-1">{system.domain}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('markets')}
              </dt>
              <dd className="mt-1 flex gap-2">
                {system.markets.map((market) => (
                  <Badge key={market} variant="outline">
                    {market}
                  </Badge>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('endUsers')}
              </dt>
              <dd className="mt-1 flex gap-2">
                {system.endUsers.map((user) => (
                  <Badge key={user} variant="outline">
                    {user}
                  </Badge>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        {/* Risk classification */}
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">{t('riskClassification')}</h2>
          <div className="mt-4 space-y-4">
            {system.riskLevel ? (
              <>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {t('riskLevel')}
                  </div>
                  <div className="mt-2">
                    <Badge variant={getRiskBadgeVariant(system.riskLevel)}>
                      {tClass(system.riskLevel.toLowerCase())}
                    </Badge>
                  </div>
                </div>

                {system.annexIIICategory && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {t('annexCategory')}
                    </div>
                    <div className="mt-1">{system.annexIIICategory}</div>
                  </div>
                )}

                {system.complianceScore !== null && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {t('complianceScore')}
                    </div>
                    <div className="mt-1 text-2xl font-bold">
                      {system.complianceScore}%
                    </div>
                  </div>
                )}

                {system.classifiedAt && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {t('classifiedAt')}
                    </div>
                    <div className="mt-1 text-sm">
                      {format(new Date(system.classifiedAt), 'PPp')}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-md bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('notClassifiedYet')}
                </p>
                <Button className="mt-3" size="sm">
                  {t('classifyNow')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Characteristics */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold">{t('characteristics')}</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              {t('makesDecisions')}
            </dt>
            <dd className="mt-1">
              <Badge variant={system.makesDecisions ? 'default' : 'outline'}>
                {system.makesDecisions ? t('yes') : t('no')}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              {t('processesPersonalData')}
            </dt>
            <dd className="mt-1">
              <Badge
                variant={system.processesPersonalData ? 'default' : 'outline'}
              >
                {system.processesPersonalData ? t('yes') : t('no')}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              {t('profilesUsers')}
            </dt>
            <dd className="mt-1">
              <Badge variant={system.profilesUsers ? 'default' : 'outline'}>
                {system.profilesUsers ? t('yes') : t('no')}
              </Badge>
            </dd>
          </div>
        </dl>
      </div>

      {/* Compliance gaps */}
      {system.gaps.length > 0 && (
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">
            {t('complianceGaps')} ({system.gaps.length})
          </h2>
          <div className="mt-4 space-y-3">
            {system.gaps.slice(0, 5).map((gap) => (
              <div
                key={gap.id}
                className="flex items-start justify-between rounded-md border p-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{gap.article}</span>
                    <Badge
                      variant={
                        gap.priority === 'CRITICAL' ? 'destructive' : 'outline'
                      }
                    >
                      {gap.priority}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {gap.requirement}
                  </p>
                </div>
                <Badge variant="outline">{gap.status}</Badge>
              </div>
            ))}
            {system.gaps.length > 5 && (
              <Button variant="outline" size="sm" className="w-full">
                {t('viewAllGaps')} ({system.gaps.length})
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
