'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc/client';
import { Plus, AlertCircle, Server, ArrowRight } from 'lucide-react';
import { RiskLevel } from '@prisma/client';
import { formatDistance } from 'date-fns';

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
      return 'bg-green-400/10 text-green-400 border border-green-400/20';
    default:
      return 'bg-slate-700/50 text-slate-400 border border-slate-600/50';
  }
}

export default function SystemsPage() {
  const t = useTranslations('systems');
  const tClass = useTranslations('classification');

  const { data, isLoading, error } = trpc.system.list.useQuery({});
  const { data: countData } = trpc.system.getCount.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-medium text-slate-300">{t('loading')}</div>
          <div className="text-sm text-slate-500">{t('loadingDescription')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <div className="mt-4 text-lg font-medium text-white">{t('error')}</div>
          <div className="text-sm text-slate-400">{error.message}</div>
        </div>
      </div>
    );
  }

  const systems = data?.systems || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-slate-400 mt-1">{t('description')}</p>
          {countData && (
            <p className="mt-1 text-sm text-slate-500">
              {countData.count} / {countData.limit} {t('systemsUsed')}
            </p>
          )}
        </div>
        <Link
          href="/systems/new"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t('addSystem')}
        </Link>
      </div>

      {/* Empty state */}
      {systems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-16 text-center bg-slate-800/20">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
            <Server className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-white">{t('noSystems')}</h3>
          <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">{t('noSystemsDescription')}</p>
          <Link
            href="/systems/new"
            className="inline-flex items-center gap-2 mt-6 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:bg-emerald-400 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t('addFirstSystem')}
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-700/50 bg-slate-800/60">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.name')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.domain')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.riskLevel')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.complianceScore')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.gaps')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.created')}</div>
            <div />
          </div>
          {/* Rows */}
          {systems.map((system: any, idx: number) => (
            <div
              key={system.id}
              className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-slate-700/20 transition-colors ${idx !== systems.length - 1 ? 'border-b border-slate-700/30' : ''}`}
            >
              <div>
                <Link
                  href={`/systems/${system.id}`}
                  className="font-medium text-white hover:text-emerald-400 transition-colors"
                >
                  {system.name}
                </Link>
              </div>
              <div className="text-sm text-slate-400">{system.domain}</div>
              <div>
                {system.riskLevel ? (
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getRiskBadgeClasses(system.riskLevel)}`}>
                    {tClass(system.riskLevel.toLowerCase())}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-slate-700/50 text-slate-500 border border-slate-600/50">
                    {t('notClassified')}
                  </span>
                )}
              </div>
              <div>
                {system.complianceScore !== null ? (
                  <span className="font-semibold text-white">{system.complianceScore}%</span>
                ) : (
                  <span className="text-slate-500">-</span>
                )}
              </div>
              <div>
                {system._count.gaps > 0 ? (
                  <span className="text-sm text-red-400">{system._count.gaps} {t('open')}</span>
                ) : (
                  <span className="text-sm text-slate-500">{t('none')}</span>
                )}
              </div>
              <div className="text-sm text-slate-500">
                {formatDistance(new Date(system.createdAt), new Date(), { addSuffix: true })}
              </div>
              <div>
                <Link
                  href={`/systems/${system.id}`}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-emerald-400 hover:bg-slate-700/50 transition-all"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
