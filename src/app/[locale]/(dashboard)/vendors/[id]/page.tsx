'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  AlertCircle,
  Edit,
  Trash2,
  RefreshCw,
  Link2,
  Unlink,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  Sparkles,
  Building2,
} from 'lucide-react';
import { VendorRisk } from '@prisma/client';
import { formatDistance, format } from 'date-fns';

function getRiskBadgeClass(riskLevel: VendorRisk | null) {
  if (!riskLevel) return '';

  switch (riskLevel) {
    case 'CRITICAL':
      return 'bg-red-600 hover:bg-red-700';
    case 'HIGH':
      return 'bg-orange-500 hover:bg-orange-600';
    case 'MEDIUM':
      return 'bg-yellow-500 hover:bg-yellow-600 text-black';
    case 'LOW':
      return 'bg-green-500 hover:bg-green-600';
    default:
      return '';
  }
}

function getRiskScoreColor(score: number | null) {
  if (score === null) return 'text-muted-foreground';
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;

  const t = useTranslations('vendors');
  const tCommon = useTranslations('common');

  const [selectedSystemId, setSelectedSystemId] = useState<string>('');

  // Fetch vendor
  const {
    data: vendor,
    isLoading,
    error,
    refetch,
  } = trpc.vendor.getById.useQuery({
    id: vendorId,
  });

  // Fetch available systems to link
  const { data: systemsData } = trpc.system.list.useQuery({});

  // Mutations
  const deleteMutation = trpc.vendor.delete.useMutation({
    onSuccess: () => {
      router.push('/vendors');
    },
  });

  const assessMutation = trpc.vendor.assess.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const linkMutation = trpc.vendor.linkToSystem.useMutation({
    onSuccess: () => {
      setSelectedSystemId('');
      refetch();
    },
  });

  const unlinkMutation = trpc.vendor.unlinkFromSystem.useMutation({
    onSuccess: () => {
      refetch();
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

  if (error || !vendor) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <div className="mt-4 text-lg font-medium">{tCommon('error')}</div>
          <div className="text-sm text-muted-foreground">
            {error?.message || t('vendorNotFound')}
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/vendors')}
          >
            <ArrowLeft className="me-2 h-4 w-4" />
            {t('backToVendors')}
          </Button>
        </div>
      </div>
    );
  }

  // Get assessment data if available
  const assessmentData = vendor.assessmentData as {
    ruleBasedAssessment?: {
      score: number;
      riskLevel: string;
      riskFactors: Array<{
        factor: string;
        deduction: number;
        description: string;
        severity: string;
      }>;
      assessedAt: string;
    };
    aiAssessment?: {
      summary: string;
      recommendations: string[];
      complianceRisks: string[];
      assessedAt: string;
    };
  } | null;

  // Filter systems that are not already linked
  const linkedSystemIds = new Set(vendor.systemLinks.map((link) => link.systemId));
  const availableSystems =
    systemsData?.systems.filter((s) => !linkedSystemIds.has(s.id)) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/vendors')}
        >
          <ArrowLeft className="me-2 h-4 w-4" />
          {t('backToVendors')}
        </Button>

        <div className="mt-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{vendor.name}</h1>
              <Badge variant="outline">
                {t(`vendorTypes.${vendor.vendorType.toLowerCase()}`)}
              </Badge>
            </div>
            {vendor.lastAssessedAt && (
              <p className="mt-1 text-sm text-muted-foreground">
                {t('lastAssessed')}:{' '}
                {formatDistance(new Date(vendor.lastAssessedAt), new Date(), {
                  addSuffix: true,
                })}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => assessMutation.mutate({ id: vendorId })}
              disabled={assessMutation.isPending}
            >
              <RefreshCw
                className={`me-2 h-4 w-4 ${assessMutation.isPending ? 'animate-spin' : ''}`}
              />
              {t('reassess')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/vendors/${vendorId}/edit`)}
            >
              <Edit className="me-2 h-4 w-4" />
              {tCommon('edit')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm(t('deleteConfirm'))) {
                  deleteMutation.mutate({ id: vendorId });
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

      {/* Risk Score Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('riskAssessment')}</h2>
          {!vendor.riskScore && (
            <Button
              onClick={() => assessMutation.mutate({ id: vendorId })}
              disabled={assessMutation.isPending}
            >
              <ShieldCheck className="me-2 h-4 w-4" />
              {t('runAssessment')}
            </Button>
          )}
        </div>

        {vendor.riskScore !== null ? (
          <div className="mt-6">
            <div className="flex items-center gap-8">
              {/* Big Risk Score */}
              <div className="text-center">
                <div
                  className={`text-6xl font-bold ${getRiskScoreColor(vendor.riskScore)}`}
                >
                  {vendor.riskScore}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {t('riskScore')}
                </div>
              </div>

              {/* Risk Level Badge */}
              {vendor.riskLevel && (
                <div>
                  <Badge
                    className={`text-lg px-4 py-2 ${getRiskBadgeClass(vendor.riskLevel)}`}
                  >
                    {t(`riskLevels.${vendor.riskLevel.toLowerCase()}`)}
                  </Badge>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {vendor.riskScore >= 80 && t('riskDescriptions.low')}
                    {vendor.riskScore >= 60 &&
                      vendor.riskScore < 80 &&
                      t('riskDescriptions.medium')}
                    {vendor.riskScore >= 40 &&
                      vendor.riskScore < 60 &&
                      t('riskDescriptions.high')}
                    {vendor.riskScore < 40 && t('riskDescriptions.critical')}
                  </div>
                </div>
              )}
            </div>

            {/* Risk Factors */}
            {assessmentData?.ruleBasedAssessment?.riskFactors &&
              assessmentData.ruleBasedAssessment.riskFactors.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    {t('riskFactors')}
                  </h3>
                  <div className="space-y-2">
                    {assessmentData.ruleBasedAssessment.riskFactors.map(
                      (factor, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 rounded-md border p-3"
                        >
                          <ShieldAlert
                            className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                              factor.severity === 'CRITICAL'
                                ? 'text-red-600'
                                : factor.severity === 'HIGH'
                                  ? 'text-orange-500'
                                  : factor.severity === 'MEDIUM'
                                    ? 'text-yellow-500'
                                    : 'text-blue-500'
                            }`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {t(`factors.${factor.factor}`, {
                                  fallback: factor.factor,
                                })}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs text-red-600"
                              >
                                -{factor.deduction}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {factor.description}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        ) : (
          <div className="mt-6 text-center py-8">
            <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="mt-4 text-lg font-medium">{t('notAssessedYet')}</div>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('notAssessedDescription')}
            </p>
          </div>
        )}
      </Card>

      {/* AI Assessment Section */}
      {assessmentData?.aiAssessment && (
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h2 className="text-xl font-semibold">{t('aiRecommendations')}</h2>
          </div>

          <div className="mt-4 space-y-4">
            {/* Summary */}
            {assessmentData.aiAssessment.summary && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {t('summary')}
                </h3>
                <p className="text-sm">{assessmentData.aiAssessment.summary}</p>
              </div>
            )}

            {/* Recommendations */}
            {assessmentData.aiAssessment.recommendations &&
              assessmentData.aiAssessment.recommendations.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    {t('recommendations')}
                  </h3>
                  <ul className="space-y-2">
                    {assessmentData.aiAssessment.recommendations.map(
                      (rec, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* Compliance Risks */}
            {assessmentData.aiAssessment.complianceRisks &&
              assessmentData.aiAssessment.complianceRisks.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    {t('complianceRisks')}
                  </h3>
                  <ul className="space-y-2">
                    {assessmentData.aiAssessment.complianceRisks.map(
                      (risk, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          {risk}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
          </div>
        </Card>
      )}

      {/* Grid for vendor details and linked systems */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Vendor Details */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold">{t('vendorDetails')}</h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('form.dataUsedForTraining')}
              </dt>
              <dd className="mt-1 flex items-center gap-2">
                {vendor.dataUsedForTraining === true ? (
                  <>
                    <X className="h-4 w-4 text-red-500" />
                    <span>{tCommon('yes')}</span>
                  </>
                ) : vendor.dataUsedForTraining === false ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{tCommon('no')}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">{t('unknown')}</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('form.dataProcessingLocation')}
              </dt>
              <dd className="mt-1">
                {vendor.dataProcessingLocation ? (
                  <Badge variant="outline">{vendor.dataProcessingLocation}</Badge>
                ) : (
                  <span className="text-muted-foreground">{t('unknown')}</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('form.hasDPA')}
              </dt>
              <dd className="mt-1 flex items-center gap-2">
                {vendor.hasDPA ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{tCommon('yes')}</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-red-500" />
                    <span>{tCommon('no')}</span>
                  </>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('form.hasModelCard')}
              </dt>
              <dd className="mt-1 flex items-center gap-2">
                {vendor.hasModelCard ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{tCommon('yes')}</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-red-500" />
                    <span>{tCommon('no')}</span>
                  </>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('form.supportsAIAct')}
              </dt>
              <dd className="mt-1 flex items-center gap-2">
                {vendor.supportsAIAct === true ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{tCommon('yes')}</span>
                  </>
                ) : vendor.supportsAIAct === false ? (
                  <>
                    <X className="h-4 w-4 text-red-500" />
                    <span>{tCommon('no')}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">{t('unknown')}</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('form.usesSubprocessors')}
              </dt>
              <dd className="mt-1 flex items-center gap-2">
                {vendor.usesSubprocessors ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span>{tCommon('yes')}</span>
                    {vendor.subprocessorsDocumented ? (
                      <Badge variant="outline" className="ms-2">
                        {t('documented')}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="ms-2">
                        {t('notDocumented')}
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{tCommon('no')}</span>
                  </>
                )}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Linked AI Systems */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('linkedSystems')}</h2>
            <Badge variant="outline">
              {vendor.systemLinks.length} {t('systems')}
            </Badge>
          </div>

          {/* Link new system */}
          {availableSystems.length > 0 && (
            <div className="mt-4 flex gap-2">
              <Select
                value={selectedSystemId}
                onValueChange={setSelectedSystemId}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t('selectSystemToLink')} />
                </SelectTrigger>
                <SelectContent>
                  {availableSystems.map((system) => (
                    <SelectItem key={system.id} value={system.id}>
                      {system.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                disabled={!selectedSystemId || linkMutation.isPending}
                onClick={() => {
                  if (selectedSystemId) {
                    linkMutation.mutate({
                      vendorId,
                      systemId: selectedSystemId,
                    });
                  }
                }}
              >
                <Link2 className="me-2 h-4 w-4" />
                {t('link')}
              </Button>
            </div>
          )}

          {/* Linked systems list */}
          <div className="mt-4 space-y-2">
            {vendor.systemLinks.length === 0 ? (
              <div className="py-8 text-center">
                <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('noLinkedSystems')}
                </p>
              </div>
            ) : (
              vendor.systemLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <Link
                      href={`/systems/${link.system.id}`}
                      className="font-medium hover:underline"
                    >
                      {link.system.name}
                    </Link>
                    {link.system.riskLevel && (
                      <Badge variant="outline" className="ms-2 text-xs">
                        {link.system.riskLevel}
                      </Badge>
                    )}
                    {link.system.complianceScore !== null && (
                      <span className="ms-2 text-xs text-muted-foreground">
                        {link.system.complianceScore}% {t('compliance')}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(t('unlinkConfirm'))) {
                        unlinkMutation.mutate({
                          vendorId,
                          systemId: link.system.id,
                        });
                      }
                    }}
                    disabled={unlinkMutation.isPending}
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Timestamps */}
      <div className="text-xs text-muted-foreground">
        {t('createdAt')}: {format(new Date(vendor.createdAt), 'PPp')}
        {vendor.updatedAt && vendor.updatedAt !== vendor.createdAt && (
          <>
            {' · '}
            {t('updatedAt')}: {format(new Date(vendor.updatedAt), 'PPp')}
          </>
        )}
      </div>

      {/* Legal Disclaimer */}
      <div className="rounded-md border border-muted bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">
          {t('disclaimer')}
        </p>
      </div>
    </div>
  );
}
