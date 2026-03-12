'use client';

import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc/client';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, AlertCircle, Edit, Trash2, RefreshCw, ExternalLink } from 'lucide-react';
import { RiskLevel } from '@prisma/client';
import { format } from 'date-fns';

function getRiskBadgeClasses(riskLevel: RiskLevel | null) {
  if (!riskLevel) return 'bg-slate-700/50 text-slate-400 border border-slate-600/50';
  switch (riskLevel) {
    case 'UNACCEPTABLE':
      return 'bg-red-500/10 text-red-400 border border-red-500/20';
    case 'HIGH':
      return 'bg-red-400/10 text-red-400 border border-red-400/20';
    case 'LIMITED':
      return 'bg-amber-400/10 text-amber-400 border border-amber-400/20';
    case 'MINIMAL':
      return 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20';
    default:
      return 'bg-slate-700/50 text-slate-400 border border-slate-600/50';
  }
}

export default function SystemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const systemId = params.id as string;

  const t = useTranslations('systems');
  const tClass = useTranslations('classification');
  const tCommon = useTranslations('common');

  const { data: system, isLoading, error } = trpc.system.getById.useQuery({ id: systemId });

  const deleteMutation = trpc.system.delete.useMutation({
    onSuccess: () => { router.push('/systems'); },
  });

  const reclassifyMutation = trpc.classification.reclassify.useMutation({
    onSuccess: () => { window.location.reload(); },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg font-medium text-slate-300">{tCommon('loading')}</div>
      </div>
    );
  }

  if (error || !system) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <div className="mt-4 text-lg font-medium text-white">{tCommon('error')}</div>
          <div className="text-sm text-slate-400">{error?.message || t('systemNotFound')}</div>
          <button
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
            onClick={() => router.push('/systems')}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToSystems')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/systems')}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToSystems')}
        </button>

        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{system.name}</h1>
            <p className="mt-1 text-slate-400">{system.description}</p>
          </div>

          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
              <Edit className="h-4 w-4" />
              {tCommon('edit')}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
              onClick={() => {
                if (confirm(t('deleteConfirm'))) {
                  deleteMutation.mutate({ id: systemId });
                }
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
              {tCommon('delete')}
            </button>
          </div>
        </div>
      </div>

      {/* Classification Result */}
      {system.riskLevel && (
        <div className="rounded-xl bg-slate-800/60 border border-slate-600/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('classificationResult')}</h2>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
              onClick={() => reclassifyMutation.mutate({ systemId })}
              disabled={reclassifyMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 ${reclassifyMutation.isPending ? 'animate-spin' : ''}`} />
              {t('reclassify')}
            </button>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Risk Level */}
            <div>
              <div className="text-sm text-slate-400">{t('riskLevel')}</div>
              <div className="mt-2">
                <span className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-semibold ${getRiskBadgeClasses(system.riskLevel)}`}>
                  {tClass(system.riskLevel.toLowerCase())}
                </span>
              </div>
            </div>

            {/* Confidence Score */}
            {system.confidenceScore !== null && system.confidenceScore !== undefined && (
              <div>
                <div className="text-sm text-slate-400">{t('confidenceScore')}</div>
                <div className="mt-2 text-2xl font-bold text-white">
                  {Math.round(system.confidenceScore * 100)}%
                </div>
                <Progress value={system.confidenceScore * 100} className="mt-2 h-2" />
              </div>
            )}

            {/* Annex III Category */}
            {system.annexIIICategory && (
              <div>
                <div className="text-sm text-slate-400">{t('annexCategory')}</div>
                <div className="mt-1 font-medium text-white">{system.annexIIICategory}</div>
                {system.annexIIISubcategory && (
                  <div className="mt-1 text-sm text-slate-400">{system.annexIIISubcategory}</div>
                )}
              </div>
            )}

            {/* Provider/Deployer */}
            {system.providerOrDeployer && (
              <div>
                <div className="text-sm text-slate-400">{t('role')}</div>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                    {system.providerOrDeployer}
                  </span>
                </div>
              </div>
            )}

            {/* Compliance Score */}
            {system.complianceScore !== null && (
              <div>
                <div className="text-sm text-slate-400">{t('complianceScore')}</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="text-2xl font-bold text-white">{system.complianceScore}%</div>
                  <Progress value={system.complianceScore} className="h-2 flex-1" />
                </div>
              </div>
            )}

            {/* Classification Date */}
            {system.classifiedAt && (
              <div>
                <div className="text-sm text-slate-400">{t('classifiedAt')}</div>
                <div className="mt-1 text-white">{format(new Date(system.classifiedAt), 'PPp')}</div>
              </div>
            )}
          </div>

          {/* Exception Applied */}
          {system.exceptionApplies && system.exceptionReason && (
            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-amber-400">{t('exceptionApplied')}</div>
                  <div className="mt-1 text-sm text-amber-300/70">{system.exceptionReason}</div>
                </div>
              </div>
            </div>
          )}

          {/* Classification Reasoning */}
          {system.classificationReasoning && (
            <div className="mt-4">
              <div className="text-sm text-slate-400">{t('reasoning')}</div>
              <div className="mt-2 rounded-xl bg-slate-900/50 border border-slate-700/50 p-4 text-sm text-slate-300">
                {system.classificationReasoning}
              </div>
            </div>
          )}

          {/* Link to Gaps */}
          {system.gaps.length > 0 && (
            <div className="mt-4">
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors"
                onClick={() => router.push(`/systems/${systemId}/gaps`)}
              >
                {t('viewComplianceGaps')} ({system.gaps.length})
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Not classified state */}
      {!system.riskLevel && (
        <div className="rounded-xl bg-slate-800/60 border border-slate-600/60 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-500" />
          <div className="mt-4 text-lg font-medium text-white">{t('notClassifiedYet')}</div>
          <div className="mt-2 text-sm text-slate-400">{t('notClassifiedDescription')}</div>
          <button
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors disabled:opacity-50"
            onClick={() => reclassifyMutation.mutate({ systemId })}
            disabled={reclassifyMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 ${reclassifyMutation.isPending ? 'animate-spin' : ''}`} />
            {t('classifyNow')}
          </button>
        </div>
      )}

      {/* Main info grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic information */}
        <div className="rounded-xl bg-slate-800/60 border border-slate-600/60 p-6">
          <h2 className="text-lg font-semibold text-white">{t('basicInformation')}</h2>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-sm text-slate-400">{t('aiType')}</dt>
              <dd className="mt-1 text-white">{system.aiType}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-400">{t('domain')}</dt>
              <dd className="mt-1 text-white">{system.domain}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-400">{t('markets')}</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {system.markets.map((market: string) => (
                  <span key={market} className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                    {market}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-400">{t('endUsers')}</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {system.endUsers.map((user: string) => (
                  <span key={user} className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                    {user}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        {/* Characteristics */}
        <div className="rounded-xl bg-slate-800/60 border border-slate-600/60 p-6">
          <h2 className="text-lg font-semibold text-white">{t('characteristics')}</h2>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-sm text-slate-400">{t('makesDecisions')}</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${system.makesDecisions ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-slate-700/50 text-slate-400 border-slate-600/50'}`}>
                  {system.makesDecisions ? t('yes') : t('no')}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-400">{t('processesPersonalData')}</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${system.processesPersonalData ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 'bg-slate-700/50 text-slate-400 border-slate-600/50'}`}>
                  {system.processesPersonalData ? t('yes') : t('no')}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-400">{t('profilesUsers')}</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${system.profilesUsers ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 'bg-slate-700/50 text-slate-400 border-slate-600/50'}`}>
                  {system.profilesUsers ? t('yes') : t('no')}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
