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
import {
  Plus,
  AlertCircle,
  FileBox,
  Lock,
  FileText,
  Camera,
  Terminal,
  FlaskConical,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { formatDistance } from 'date-fns';

function getTypeBadgeClasses(type: string): string {
  switch (type) {
    case 'DOCUMENT':
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'SCREENSHOT':
      return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
    case 'LOG':
      return 'bg-amber-400/10 text-amber-400 border border-amber-400/20';
    case 'TEST_RESULT':
      return 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20';
    default:
      return 'bg-slate-700/50 text-slate-400 border border-slate-600/50';
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'DOCUMENT':
      return <FileText className="h-3 w-3 me-1" />;
    case 'SCREENSHOT':
      return <Camera className="h-3 w-3 me-1" />;
    case 'LOG':
      return <Terminal className="h-3 w-3 me-1" />;
    case 'TEST_RESULT':
      return <FlaskConical className="h-3 w-3 me-1" />;
    default:
      return null;
  }
}

export default function EvidencePage() {
  const t = useTranslations('evidence');
  const tCommon = useTranslations('common');

  const [systemFilter, setSystemFilter] = useState<string>('ALL');
  const [articleFilter, setArticleFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const { data: accessData, isLoading: isCheckingAccess } =
    trpc.evidence.checkAccess.useQuery();

  const { data, isLoading, error } = trpc.evidence.list.useQuery(
    {
      ...(systemFilter !== 'ALL' && { systemId: systemFilter }),
      ...(articleFilter !== 'ALL' && { article: articleFilter }),
      ...(typeFilter !== 'ALL' && {
        evidenceType: typeFilter as 'DOCUMENT' | 'SCREENSHOT' | 'LOG' | 'TEST_RESULT',
      }),
    },
    { enabled: accessData?.hasAccess === true }
  );

  const { data: systemsData } = trpc.evidence.getAvailableSystems.useQuery(
    undefined,
    { enabled: accessData?.hasAccess === true }
  );

  const { data: articleOptions } = trpc.evidence.getArticleOptions.useQuery(
    undefined,
    { enabled: accessData?.hasAccess === true }
  );

  if (isCheckingAccess || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-medium text-slate-300">{tCommon('loading')}</div>
          <div className="text-sm text-slate-500">{t('loadingDescription')}</div>
        </div>
      </div>
    );
  }

  if (!accessData?.hasAccess) {
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

        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white">{t('whyEvidenceVault')}</h3>
              <p className="mt-2 text-sm text-slate-400">{t('whyEvidenceVaultDescription')}</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-500">
                <li>• {t('benefit1')}</li>
                <li>• {t('benefit2')}</li>
                <li>• {t('benefit3')}</li>
                <li>• {t('benefit4')}</li>
              </ul>
            </div>
          </div>
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

  const evidence = data?.evidence || [];
  const systems = systemsData || [];
  const articles = articleOptions || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-slate-400 mt-1">{t('description')}</p>
        </div>

        <Link
          href="/evidence/new"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t('addEvidence')}
        </Link>
      </div>

      {/* Filters */}
      {(evidence.length > 0 || systemFilter !== 'ALL' || articleFilter !== 'ALL' || typeFilter !== 'ALL') && (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">{t('filterBySystem')}:</span>
            <Select value={systemFilter} onValueChange={setSystemFilter}>
              <SelectTrigger className="w-[180px] bg-slate-800/60 border-slate-600/60 text-slate-300">
                <SelectValue placeholder={t('allSystems')} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="ALL">{t('allSystems')}</SelectItem>
                {systems.map((system) => (
                  <SelectItem key={system.id} value={system.id}>
                    {system.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">{t('filterByArticle')}:</span>
            <Select value={articleFilter} onValueChange={setArticleFilter}>
              <SelectTrigger className="w-[200px] bg-slate-800/60 border-slate-600/60 text-slate-300">
                <SelectValue placeholder={t('allArticles')} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="ALL">{t('allArticles')}</SelectItem>
                {articles.map((article) => (
                  <SelectItem key={article.value} value={article.value}>
                    {article.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">{t('filterByType')}:</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px] bg-slate-800/60 border-slate-600/60 text-slate-300">
                <SelectValue placeholder={t('allTypes')} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="ALL">{t('allTypes')}</SelectItem>
                <SelectItem value="DOCUMENT">{t('types.document')}</SelectItem>
                <SelectItem value="SCREENSHOT">{t('types.screenshot')}</SelectItem>
                <SelectItem value="LOG">{t('types.log')}</SelectItem>
                <SelectItem value="TEST_RESULT">{t('types.testResult')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Evidence table */}
      {evidence.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-16 text-center bg-slate-800/20">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
            <FileBox className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-white">{t('noEvidence')}</h3>
          <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">{t('noEvidenceDescription')}</p>
          <Link
            href="/evidence/new"
            className="inline-flex items-center gap-2 mt-6 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:bg-emerald-400 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t('addFirstEvidence')}
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-600/60 bg-slate-800/60 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-700/50 bg-slate-800/60">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.title')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.type')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.linkedSystem')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.article')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.integrityHash')}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.createdAt')}</div>
            <div />
          </div>
          {/* Rows */}
          {evidence.map((item, idx) => (
            <div
              key={item.id}
              className={`grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-slate-700/20 transition-colors ${idx !== evidence.length - 1 ? 'border-b border-slate-700/30' : ''}`}
            >
              <div>
                <Link
                  href={`/evidence/${item.id}`}
                  className="font-medium text-white hover:text-emerald-400 transition-colors"
                >
                  {item.title}
                </Link>
              </div>
              <div>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getTypeBadgeClasses(item.evidenceType)}`}>
                  {getTypeIcon(item.evidenceType)}
                  {t(`types.${item.evidenceType.toLowerCase()}`)}
                </span>
              </div>
              <div>
                {item.system ? (
                  <Link
                    href={`/systems/${item.system.id}`}
                    className="text-sm text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    {item.system.name}
                  </Link>
                ) : (
                  <span className="text-sm text-slate-500">-</span>
                )}
              </div>
              <div>
                {item.article ? (
                  <span className="text-sm text-slate-300">{item.article}</span>
                ) : (
                  <span className="text-sm text-slate-500">-</span>
                )}
              </div>
              <div>
                {item.integrityHash ? (
                  <code className="text-xs bg-slate-700/60 text-slate-300 border border-slate-600/40 px-1.5 py-0.5 rounded font-mono">
                    {item.integrityHash.slice(0, 8)}…
                  </code>
                ) : (
                  <span className="text-sm text-slate-500">-</span>
                )}
              </div>
              <div className="text-sm text-slate-500">
                {formatDistance(new Date(item.createdAt), new Date(), { addSuffix: true })}
              </div>
              <div>
                <Link
                  href={`/evidence/${item.id}`}
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
