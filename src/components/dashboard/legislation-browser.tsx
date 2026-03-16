'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc/client';
import { ExternalLink, Globe, Lock, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from '@/i18n/navigation';

function getImpactBadgeClasses(impact: string) {
  switch (impact) {
    case 'HIGH':
      return 'bg-red-500/10 text-red-400 border border-red-500/20';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'LOW':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    default:
      return 'bg-slate-700/50 text-slate-400 border border-slate-600/50';
  }
}

function getStatusBadgeClasses(status: string) {
  switch (status) {
    case 'enacted':
    case 'in_force':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'proposed':
    case 'pending':
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'rescinded':
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    default:
      return 'bg-slate-700/50 text-slate-400 border border-slate-600/50';
  }
}

const JURISDICTION_OPTIONS = [
  'EU', 'UK', 'US-FED', 'US-CO', 'US-CA', 'US-NY', 'US-IL',
  'US-TX', 'US-VA', 'US-CT', 'US-MA', 'US-WA', 'US-MD',
  'CN', 'CA', 'BR', 'SG', 'JP', 'KR', 'AU', 'IN',
];

const STATUS_OPTIONS = ['enacted', 'proposed', 'in_force', 'rescinded', 'pending'];

export function LegislationBrowser() {
  const t = useTranslations('intelligence.legislation');

  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allEntries, setAllEntries] = useState<Array<Record<string, unknown>>>([]);

  const { data, isLoading, error } = trpc.intelligence.getLegislation.useQuery(
    {
      limit: 10,
      ...(jurisdictionFilter !== 'ALL' ? { jurisdiction: jurisdictionFilter } : {}),
      ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
      ...(cursor ? { cursor } : {}),
    },
    {
      onSuccess: (newData) => {
        if (cursor) {
          // Appending — merge with existing
          setAllEntries((prev) => [...prev, ...newData.entries]);
        } else {
          // Fresh query (filter changed)
          setAllEntries(newData.entries);
        }
      },
    }
  );

  // Reset cursor when filters change
  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    setCursor(undefined);
    setAllEntries([]);
  };

  const entries = cursor ? allEntries : (data?.entries ?? []);
  const totalEstimate = data?.totalEstimate ?? 0;
  const hasMore = !!data?.nextCursor;

  const handleLoadMore = () => {
    if (data?.nextCursor) {
      setCursor(data.nextCursor);
    }
  };

  if (error) {
    return null; // Silently hide if tRPC fails (e.g., no legislation data)
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Globe className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{t('title')}</h2>
            <p className="text-sm text-slate-400">
              {t('subtitle')} · {t('entries', { count: totalEstimate })}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={jurisdictionFilter}
          onChange={(e) => handleFilterChange(setJurisdictionFilter, e.target.value)}
          className="rounded-lg border border-slate-600/60 bg-slate-700/50 px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
        >
          <option value="ALL" className="bg-slate-800">{t('allJurisdictions')}</option>
          {JURISDICTION_OPTIONS.map((j) => (
            <option key={j} value={j} className="bg-slate-800">
              {t(`jurisdictions.${j}` as any)}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
          className="rounded-lg border border-slate-600/60 bg-slate-700/50 px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
        >
          <option value="ALL" className="bg-slate-800">{t('allStatuses')}</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="bg-slate-800">
              {t(`status.${s}` as any)}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {isLoading && entries.length === 0 && (
        <div className="py-8 text-center">
          <div className="text-sm text-slate-400">Loading legislation...</div>
        </div>
      )}

      {/* Entries */}
      {!isLoading && entries.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 p-12 text-center bg-slate-800/20">
          <Globe className="mx-auto h-8 w-8 text-slate-600" />
          <p className="mt-3 text-sm text-slate-400">{t('noResults')}</p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry: any) => (
            <div
              key={entry.id}
              className="rounded-xl border border-slate-600/60 bg-slate-800/60 p-5 hover:border-slate-500/60 transition-colors"
            >
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-md bg-slate-700/60 px-2 py-0.5 text-xs font-medium text-slate-300 border border-slate-600/50">
                  {t(`jurisdictions.${entry.jurisdiction}` as any) || entry.jurisdiction}
                </span>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getStatusBadgeClasses(entry.status)}`}>
                  {t(`status.${entry.status}` as any) || entry.status}
                </span>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getImpactBadgeClasses(entry.impactLevel)}`}>
                  {t(`impact.${entry.impactLevel}` as any)}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-base text-white">{entry.title}</h3>

              {/* Summary & key provisions (plan-gated) */}
              {entry.summary !== null ? (
                <>
                  <p className="mt-2 text-sm text-slate-400 line-clamp-3">{entry.summary}</p>
                  {entry.keyProvisions && Array.isArray(entry.keyProvisions) && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-slate-500 mb-1.5">{t('keyProvisions')}</p>
                      <ul className="space-y-1">
                        {(entry.keyProvisions as string[]).slice(0, 3).map((provision: string, i: number) => (
                          <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                            <span className="text-emerald-500 mt-1">•</span>
                            {provision}
                          </li>
                        ))}
                        {(entry.keyProvisions as string[]).length > 3 && (
                          <li className="text-xs text-slate-500">
                            +{(entry.keyProvisions as string[]).length - 3} more...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Lock className="h-4 w-4" />
                  <span>{t('upgradeForDetails')}</span>
                  <Link href="/pricing" className="text-emerald-400 hover:text-emerald-300">
                    →
                  </Link>
                </div>
              )}

              {/* Footer */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  {entry.effectiveDate && (
                    <span>{t('effectiveDate')}: {format(new Date(entry.effectiveDate), 'MMM d, yyyy')}</span>
                  )}
                  <span>{t('lastVerified')}: {format(new Date(entry.lastVerified), 'MMM d, yyyy')}</span>
                </div>
                {entry.sourceUrl && (
                  <a
                    href={entry.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {t('viewSource')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* Load more */}
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-600/60 bg-slate-800/40 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ChevronDown className="h-4 w-4" />
              {isLoading ? '...' : t('loadMore')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
