'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, AlertCircle, Building2, ShieldAlert, Lock, ArrowRight } from 'lucide-react';
import { VendorRisk } from '@prisma/client';
import { formatDistance } from 'date-fns';

function getRiskBadgeClasses(riskLevel: VendorRisk | null): string {
  if (!riskLevel) return 'bg-slate-700/50 text-slate-400 border border-slate-600/50';
  switch (riskLevel) {
    case 'CRITICAL':
      return 'bg-red-500/10 text-red-400 border border-red-500/20';
    case 'HIGH':
      return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    case 'MEDIUM':
      return 'bg-amber-400/10 text-amber-400 border border-amber-400/20';
    case 'LOW':
      return 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20';
    default:
      return 'bg-slate-700/50 text-slate-400 border border-slate-600/50';
  }
}

export default function VendorsPage() {
  const t = useTranslations('vendors');
  const tCommon = useTranslations('common');

  const [riskLevelFilter, setRiskLevelFilter] = useState<VendorRisk | 'ALL'>('ALL');

  // Fetch vendors
  const { data, isLoading, error } = trpc.vendor.list.useQuery(
    riskLevelFilter !== 'ALL' ? { riskLevel: riskLevelFilter } : {}
  );
  const { data: countData } = trpc.vendor.getCount.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-medium text-slate-300">{tCommon('loading')}</div>
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
          <div className="mt-4 text-lg font-medium text-white">{tCommon('error')}</div>
          <div className="text-sm text-slate-400">{error.message}</div>
        </div>
      </div>
    );
  }

  const vendors = data?.vendors || [];
  const isFree = countData?.limit === 0;
  const canCreate = countData?.canCreate ?? false;
  const limitReached = !canCreate && !isFree && countData?.limit !== null;

  // Free plan upgrade message
  if (isFree) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-slate-400 mt-1">{t('description')}</p>
        </div>

        <div className="rounded-xl bg-slate-800/60 border border-slate-600/60 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-700/50 border border-slate-700 flex items-center justify-center mx-auto">
            <Lock className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-white">{t('upgradeRequired')}</h3>
          <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">{t('upgradeMessage')}</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 mt-6 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:bg-emerald-400 transition-colors"
          >
            {t('upgradeToPlan')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-slate-400 mt-1">{t('description')}</p>
          {countData && countData.limit !== null && (
            <p className="mt-1 text-sm text-slate-500">
              {countData.count} / {countData.limit} {t('vendorsUsed')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {limitReached && (
            <Link href="/pricing" className="text-sm text-emerald-400 hover:text-emerald-300">
              {t('upgradeToPlan')}
            </Link>
          )}
          {canCreate ? (
            <Link
              href="/vendors/new"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('addVendor')}
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-500 cursor-not-allowed">
              <Plus className="h-4 w-4" />
              {t('addVendor')}
            </span>
          )}
        </div>
      </div>

      {/* Limit Reached Warning */}
      {limitReached && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-amber-400">{t('limitReached')}</div>
              <div className="mt-1 text-sm text-amber-400/70">{t('limitReachedMessage')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {vendors.length > 0 && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{t('filterByRisk')}:</span>
          <Select
            value={riskLevelFilter}
            onValueChange={(value) => setRiskLevelFilter(value as VendorRisk | 'ALL')}
          >
            <SelectTrigger className="w-[180px] bg-slate-800/60 border-slate-600/60 text-slate-300">
              <SelectValue placeholder={t('allRiskLevels')} />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="ALL">{t('allRiskLevels')}</SelectItem>
              <SelectItem value="CRITICAL">{t('riskLevels.critical')}</SelectItem>
              <SelectItem value="HIGH">{t('riskLevels.high')}</SelectItem>
              <SelectItem value="MEDIUM">{t('riskLevels.medium')}</SelectItem>
              <SelectItem value="LOW">{t('riskLevels.low')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Vendors table */}
      {vendors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-16 text-center bg-slate-800/20">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
            <Building2 className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-white">{t('noVendors')}</h3>
          <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">{t('noVendorsDescription')}</p>
          <Link
            href="/vendors/new"
            className="inline-flex items-center gap-2 mt-6 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:bg-emerald-400 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t('addFirstVendor')}
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-700/50 bg-slate-800/60">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.name')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.type')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.riskScore')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.riskLevel')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.linkedSystems')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.lastAssessed')}</div>
            <div />
          </div>
          {/* Rows */}
          {vendors.map((vendor, idx) => (
            <div
              key={vendor.id}
              className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-slate-700/20 transition-colors ${idx !== vendors.length - 1 ? 'border-b border-slate-700/30' : ''}`}
            >
              <div>
                <Link
                  href={`/vendors/${vendor.id}`}
                  className="font-medium text-white hover:text-emerald-400 transition-colors"
                >
                  {vendor.name}
                </Link>
              </div>
              <div>
                <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                  {t(`vendorTypes.${vendor.vendorType.toLowerCase()}`)}
                </span>
              </div>
              <div>
                {vendor.riskScore !== null ? (
                  <span className="font-semibold text-white">{vendor.riskScore}</span>
                ) : (
                  <span className="text-slate-500">-</span>
                )}
              </div>
              <div>
                {vendor.riskLevel ? (
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getRiskBadgeClasses(vendor.riskLevel)}`}>
                    {t(`riskLevels.${vendor.riskLevel.toLowerCase()}`)}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-slate-700/50 text-slate-500 border border-slate-600/50">
                    {t('notAssessed')}
                  </span>
                )}
              </div>
              <div>
                {vendor._count.systemLinks > 0 ? (
                  <span className="text-sm text-slate-300">{vendor._count.systemLinks} {t('systems')}</span>
                ) : (
                  <span className="text-sm text-slate-500">{t('noLinkedSystems')}</span>
                )}
              </div>
              <div className="text-sm text-slate-500">
                {vendor.lastAssessedAt
                  ? formatDistance(new Date(vendor.lastAssessedAt), new Date(), { addSuffix: true })
                  : t('never')}
              </div>
              <div>
                <Link
                  href={`/vendors/${vendor.id}`}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-emerald-400 hover:bg-slate-700/50 transition-all"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warning for high-risk vendors */}
      {vendors.some((v) => v.riskLevel === 'CRITICAL' || v.riskLevel === 'HIGH') && (
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-orange-400">{t('highRiskWarning')}</div>
              <div className="mt-1 text-sm text-orange-400/70">{t('highRiskWarningDescription')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
