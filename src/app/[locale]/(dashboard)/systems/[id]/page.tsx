'use client';

import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, AlertCircle, Edit, Trash2, RefreshCw, ExternalLink, Shield, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { RiskLevel } from '@prisma/client';
import { format } from 'date-fns';

function getRiskConfig(riskLevel: RiskLevel | null) {
  if (!riskLevel) {
    return {
      label: '—',
      bg: 'bg-slate-700/40',
      border: 'border-slate-600/50',
      text: 'text-slate-400',
      glow: '',
      dot: 'bg-slate-500',
      icon: <Shield className="h-6 w-6" />,
      barColor: 'bg-slate-500',
    };
  }
  switch (riskLevel) {
    case 'UNACCEPTABLE':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        glow: 'shadow-[0_0_40px_rgba(239,68,68,0.15)]',
        dot: 'bg-red-500',
        icon: <XCircle className="h-6 w-6" />,
        barColor: 'bg-red-500',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        glow: 'shadow-[0_0_40px_rgba(249,115,22,0.12)]',
        dot: 'bg-orange-500',
        icon: <AlertCircle className="h-6 w-6" />,
        barColor: 'bg-orange-500',
      };
    case 'LIMITED':
      return {
        bg: 'bg-amber-400/10',
        border: 'border-amber-400/30',
        text: 'text-amber-400',
        glow: 'shadow-[0_0_40px_rgba(251,191,36,0.10)]',
        dot: 'bg-amber-400',
        icon: <AlertTriangle className="h-6 w-6" />,
        barColor: 'bg-amber-400',
      };
    case 'MINIMAL':
      return {
        bg: 'bg-emerald-400/10',
        border: 'border-emerald-400/30',
        text: 'text-emerald-400',
        glow: 'shadow-[0_0_40px_rgba(52,211,153,0.12)]',
        dot: 'bg-emerald-400',
        icon: <CheckCircle2 className="h-6 w-6" />,
        barColor: 'bg-emerald-400',
      };
    default:
      return {
        bg: 'bg-slate-700/40',
        border: 'border-slate-600/50',
        text: 'text-slate-400',
        glow: '',
        dot: 'bg-slate-500',
        icon: <Shield className="h-6 w-6" />,
        barColor: 'bg-slate-500',
      };
  }
}

function ScoreRing({ value, color }: { value: number; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
      <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-700/60" />
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className={color}
        stroke="currentColor"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  );
}

export default function SystemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const systemId = params.id as string;

  const t = useTranslations('systems');
  const tClass = useTranslations('classification');
  const tCommon = useTranslations('common');

  const utils = trpc.useUtils();
  const { data: system, isLoading, error } = trpc.system.getById.useQuery({ id: systemId });

  const deleteMutation = trpc.system.delete.useMutation({
    onSuccess: () => { router.push('/systems'); },
  });

  const reclassifyMutation = trpc.classification.reclassify.useMutation({
    onSuccess: () => { utils.system.getById.invalidate({ id: systemId }); utils.system.list.invalidate(); utils.system.getStats.invalidate(); },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
          <div className="text-sm font-medium text-slate-400">{tCommon('loading')}</div>
        </div>
      </div>
    );
  }

  if (error || !system) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] p-6">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-red-400" />
          </div>
          <div className="mt-4 text-lg font-semibold text-white">{tCommon('error')}</div>
          <div className="mt-1 text-sm text-slate-400">{error?.message || t('systemNotFound')}</div>
          <button
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/80 transition-colors"
            onClick={() => router.push('/systems')}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToSystems')}
          </button>
        </div>
      </div>
    );
  }

  const riskCfg = getRiskConfig(system.riskLevel);

  return (
    <div className="space-y-5 p-6 max-w-5xl">

      {/* Back nav */}
      <button
        onClick={() => router.push('/systems')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('backToSystems')}
      </button>

      {/* ── Hero header card ── */}
      <div className={`relative overflow-hidden rounded-2xl border ${riskCfg.border} ${riskCfg.bg} ${riskCfg.glow} p-6`}>
        {/* Decorative dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        {/* Glow orb */}
        <div className={`pointer-events-none absolute -top-12 -end-12 h-40 w-40 rounded-full blur-3xl opacity-20 ${riskCfg.bg}`} />

        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            {/* System ID pill */}
            <div className="mb-2">
              <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase bg-slate-800/60 border border-slate-700/60 rounded px-2 py-0.5">
                {systemId.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white leading-tight">{system.name}</h1>
            <p className="mt-1.5 text-sm text-slate-400 max-w-xl leading-relaxed">{system.description}</p>

            {/* Risk badge */}
            {system.riskLevel && (
              <div className={`mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold ${riskCfg.border} ${riskCfg.text}`}>
                <span className={`h-2 w-2 rounded-full ${riskCfg.dot} animate-pulse`} />
                {riskCfg.icon}
                {tClass(system.riskLevel.toLowerCase())}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700/80 transition-colors">
              <Edit className="h-3.5 w-3.5" />
              {tCommon('edit')}
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/8 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/15 transition-colors disabled:opacity-50"
              onClick={() => {
                if (confirm(t('deleteConfirm'))) {
                  deleteMutation.mutate({ id: systemId });
                }
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {tCommon('delete')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Not classified state ── */}
      {!system.riskLevel && (
        <div className="rounded-2xl bg-slate-800/50 border border-dashed border-slate-600/60 p-10 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Shield className="h-7 w-7 text-slate-500" />
          </div>
          <div className="mt-4 text-base font-semibold text-white">{t('notClassifiedYet')}</div>
          <div className="mt-1.5 text-sm text-slate-400">{t('notClassifiedDescription')}</div>
          <button
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors disabled:opacity-50"
            onClick={() => reclassifyMutation.mutate({ systemId })}
            disabled={reclassifyMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 ${reclassifyMutation.isPending ? 'animate-spin' : ''}`} />
            {t('classifyNow')}
          </button>
        </div>
      )}

      {/* ── Classification result ── */}
      {system.riskLevel && (
        <div className="rounded-2xl bg-slate-800/60 border border-slate-600/60 overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/40">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{t('classificationResult')}</h2>
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 transition-colors disabled:opacity-50"
              onClick={() => reclassifyMutation.mutate({ systemId })}
              disabled={reclassifyMutation.isPending}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${reclassifyMutation.isPending ? 'animate-spin' : ''}`} />
              {t('reclassify')}
            </button>
          </div>

          <div className="p-6">
            {/* Score panels */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
              {/* Compliance score ring */}
              {system.complianceScore !== null && (
                <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center rounded-xl bg-slate-900/50 border border-slate-700/50 p-4 gap-2">
                  <div className="relative">
                    <ScoreRing value={system.complianceScore} color="text-emerald-400" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{system.complianceScore}%</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 text-center">{t('complianceScore')}</span>
                </div>
              )}

              {/* Confidence score ring */}
              {system.confidenceScore !== null && system.confidenceScore !== undefined && (
                <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center rounded-xl bg-slate-900/50 border border-slate-700/50 p-4 gap-2">
                  <div className="relative">
                    <ScoreRing value={Math.round(system.confidenceScore * 100)} color="text-blue-400" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{Math.round(system.confidenceScore * 100)}%</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 text-center">{t('confidenceScore')}</span>
                </div>
              )}

              {/* Annex III category */}
              {system.annexIIICategory && (
                <div className="col-span-2 rounded-xl bg-slate-900/50 border border-slate-700/50 p-4">
                  <div className="text-xs text-slate-500 mb-1.5">{t('annexCategory')}</div>
                  <div className="font-semibold text-white text-sm leading-snug">{system.annexIIICategory}</div>
                  {system.annexIIISubcategory && (
                    <div className="mt-1 text-xs text-slate-400">{system.annexIIISubcategory}</div>
                  )}
                </div>
              )}

              {/* Provider / Deployer + Classified at */}
              <div className="col-span-2 grid grid-cols-2 gap-3">
                {system.providerOrDeployer && (
                  <div className="rounded-xl bg-slate-900/50 border border-slate-700/50 p-4">
                    <div className="text-xs text-slate-500 mb-1.5">{t('role')}</div>
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-slate-700/60 text-slate-300 border border-slate-600/50">
                      {system.providerOrDeployer}
                    </span>
                  </div>
                )}
                {system.classifiedAt && (
                  <div className="rounded-xl bg-slate-900/50 border border-slate-700/50 p-4">
                    <div className="text-xs text-slate-500 mb-1.5">{t('classifiedAt')}</div>
                    <div className="text-xs text-slate-300 font-mono leading-snug">
                      {format(new Date(system.classifiedAt), 'dd MMM yyyy')}<br />
                      <span className="text-slate-500">{format(new Date(system.classifiedAt), 'HH:mm')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Exception banner */}
            {system.exceptionApplies && system.exceptionReason && (
              <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide">{t('exceptionApplied')}</div>
                    <div className="mt-1 text-sm text-amber-300/70">{system.exceptionReason}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Reasoning */}
            {system.classificationReasoning && (
              <div className="mb-4">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">{t('reasoning')}</div>
                <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-4 text-sm text-slate-300 leading-relaxed">
                  {system.classificationReasoning}
                </div>
              </div>
            )}

            {/* View gaps CTA */}
            {system.gaps.length > 0 && (
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors"
                onClick={() => router.push(`/systems/${systemId}/gaps`)}
              >
                {t('viewComplianceGaps')} ({system.gaps.length})
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── System info grid ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Basic information */}
        <div className="rounded-2xl bg-slate-800/60 border border-slate-600/60 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-700/50 bg-slate-800/40">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('basicInformation')}</h2>
          </div>
          <dl className="divide-y divide-slate-700/30">
            <div className="grid grid-cols-2 gap-2 px-5 py-3.5">
              <dt className="text-xs text-slate-500">{t('aiType')}</dt>
              <dd className="text-sm text-white font-medium text-right">{system.aiType}</dd>
            </div>
            <div className="grid grid-cols-2 gap-2 px-5 py-3.5">
              <dt className="text-xs text-slate-500">{t('domain')}</dt>
              <dd className="text-sm text-white font-medium text-right">{system.domain}</dd>
            </div>
            <div className="px-5 py-3.5">
              <dt className="text-xs text-slate-500 mb-2">{t('markets')}</dt>
              <dd className="flex flex-wrap gap-1.5">
                {system.markets.map((market: string) => (
                  <span key={market} className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                    {market}
                  </span>
                ))}
              </dd>
            </div>
            <div className="px-5 py-3.5">
              <dt className="text-xs text-slate-500 mb-2">{t('endUsers')}</dt>
              <dd className="flex flex-wrap gap-1.5">
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
        <div className="rounded-2xl bg-slate-800/60 border border-slate-600/60 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-700/50 bg-slate-800/40">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('characteristics')}</h2>
          </div>
          <dl className="divide-y divide-slate-700/30">
            {[
              { key: 'makesDecisions', value: system.makesDecisions, warn: false },
              { key: 'processesPersonalData', value: system.processesPersonalData, warn: true },
              { key: 'profilesUsers', value: system.profilesUsers, warn: true },
            ].map(({ key, value, warn }) => (
              <div key={key} className="flex items-center justify-between px-5 py-3.5">
                <dt className="text-xs text-slate-500">{t(key as any)}</dt>
                <dd>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${
                    value
                      ? warn
                        ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                        : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                      : 'bg-slate-700/40 text-slate-500 border-slate-600/40'
                  }`}>
                    {value ? t('yes') : t('no')}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
