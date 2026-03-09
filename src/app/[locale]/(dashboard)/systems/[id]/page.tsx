'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, AlertCircle, Edit, Trash2, RefreshCw, ExternalLink } from 'lucide-react';
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

  // Reclassify mutation
  const reclassifyMutation = trpc.classification.reclassify.useMutation({
    onSuccess: () => {
      // Refetch system data
      window.location.reload();
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

      {/* Classification Result Section */}
      {system.riskLevel && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('classificationResult')}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => reclassifyMutation.mutate({ systemId })}
              disabled={reclassifyMutation.isPending}
            >
              <RefreshCw className={`me-2 h-4 w-4 ${reclassifyMutation.isPending ? 'animate-spin' : ''}`} />
              {t('reclassify')}
            </Button>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Risk Level Card */}
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {t('riskLevel')}
              </div>
              <div className="mt-2">
                <Badge
                  variant={getRiskBadgeVariant(system.riskLevel)}
                  className="text-base px-4 py-2"
                >
                  {tClass(system.riskLevel.toLowerCase())}
                </Badge>
              </div>
            </div>

            {/* Confidence Score */}
            {system.confidenceScore !== null && system.confidenceScore !== undefined && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('confidenceScore')}
                </div>
                <div className="mt-2 text-2xl font-bold">
                  {Math.round(system.confidenceScore * 100)}%
                </div>
                <Progress value={system.confidenceScore * 100} className="mt-2 h-2" />
              </div>
            )}

            {/* Annex III Category */}
            {system.annexIIICategory && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('annexCategory')}
                </div>
                <div className="mt-1 font-medium">{system.annexIIICategory}</div>
                {system.annexIIISubcategory && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    {system.annexIIISubcategory}
                  </div>
                )}
              </div>
            )}

            {/* Provider/Deployer */}
            {system.providerOrDeployer && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('role')}
                </div>
                <div className="mt-1">
                  <Badge variant="outline">{system.providerOrDeployer}</Badge>
                </div>
              </div>
            )}

            {/* Compliance Score */}
            {system.complianceScore !== null && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('complianceScore')}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="text-2xl font-bold">
                    {system.complianceScore}%
                  </div>
                  <Progress value={system.complianceScore} className="h-2 flex-1" />
                </div>
              </div>
            )}

            {/* Classification Date */}
            {system.classifiedAt && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('classifiedAt')}
                </div>
                <div className="mt-1">
                  {format(new Date(system.classifiedAt), 'PPp')}
                </div>
              </div>
            )}
          </div>

          {/* Exception Applied */}
          {system.exceptionApplies && system.exceptionReason && (
            <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-yellow-800">
                    {t('exceptionApplied')}
                  </div>
                  <div className="mt-1 text-sm text-yellow-700">
                    {system.exceptionReason}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Classification Reasoning */}
          {system.classificationReasoning && (
            <div className="mt-4">
              <div className="text-sm font-medium text-muted-foreground">
                {t('reasoning')}
              </div>
              <div className="mt-2 rounded-md bg-muted p-4 text-sm">
                {system.classificationReasoning}
              </div>
            </div>
          )}

          {/* Link to Gaps */}
          {system.gaps.length > 0 && (
            <div className="mt-4">
              <Button
                variant="default"
                onClick={() => router.push(`/${locale}/systems/${systemId}/gaps`)}
              >
                {t('viewComplianceGaps')} ({system.gaps.length})
                <ExternalLink className="ms-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Not classified state */}
      {!system.riskLevel && (
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <div className="mt-4 text-lg font-medium">{t('notClassifiedYet')}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {t('notClassifiedDescription')}
          </div>
          <Button
            className="mt-4"
            onClick={() => reclassifyMutation.mutate({ systemId })}
            disabled={reclassifyMutation.isPending}
          >
            <RefreshCw className={`me-2 h-4 w-4 ${reclassifyMutation.isPending ? 'animate-spin' : ''}`} />
            {t('classifyNow')}
          </Button>
        </Card>
      )}

      {/* Main info grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic information */}
        <Card className="p-6">
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
        </Card>

        {/* Characteristics */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold">{t('characteristics')}</h2>
          <dl className="mt-4 space-y-3">
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
        </Card>
      </div>

    </div>
  );
}
