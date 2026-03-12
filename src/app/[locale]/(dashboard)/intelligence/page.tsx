'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  AlertCircle,
  Bell,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  Gavel,
  Lock,
  PenTool,
  RefreshCw,
  Scale,
} from 'lucide-react';
import { format } from 'date-fns';
import { ChangeType } from '@prisma/client';

const REGULATION_OPTIONS = [
  { value: 'ALL', label: 'All Regulations' },
  { value: 'EU_AI_ACT', label: 'EU AI Act' },
  { value: 'COLORADO', label: 'Colorado AI Act' },
  { value: 'NYC_LL144', label: 'NYC LL144' },
  { value: 'NIST_RMF', label: 'NIST AI RMF' },
  { value: 'ISO_42001', label: 'ISO 42001' },
  { value: 'UAE_AI', label: 'UAE AI Ethics' },
] as const;

const CHANGE_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Types' },
  { value: 'GUIDELINE', label: 'Guideline' },
  { value: 'AMENDMENT', label: 'Amendment' },
  { value: 'ENFORCEMENT', label: 'Enforcement' },
  { value: 'INTERPRETATION', label: 'Interpretation' },
  { value: 'NEW_LAW', label: 'New Law' },
] as const;

function getRegulationBadgeClasses(regulation: string) {
  switch (regulation) {
    case 'EU_AI_ACT':
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'COLORADO':
      return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
    case 'NYC_LL144':
      return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    case 'NIST_RMF':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'ISO_42001':
      return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
    case 'UAE_AI':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    default:
      return 'bg-slate-700/50 text-slate-400 border border-slate-600/50';
  }
}

function getChangeTypeBadgeClasses(changeType: ChangeType) {
  switch (changeType) {
    case 'ENFORCEMENT':
      return 'bg-red-500/10 text-red-400 border border-red-500/20';
    case 'NEW_LAW':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'AMENDMENT':
      return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
    case 'GUIDELINE':
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'INTERPRETATION':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    default:
      return 'bg-slate-700/50 text-slate-400 border border-slate-600/50';
  }
}

function getRegulationLabel(regulation: string) {
  const option = REGULATION_OPTIONS.find((r) => r.value === regulation);
  return option?.label || regulation;
}

function getChangeTypeIcon(changeType: ChangeType) {
  switch (changeType) {
    case 'GUIDELINE':
      return <BookOpen className="h-3 w-3 me-1" />;
    case 'AMENDMENT':
      return <PenTool className="h-3 w-3 me-1" />;
    case 'ENFORCEMENT':
      return <Gavel className="h-3 w-3 me-1" />;
    case 'INTERPRETATION':
      return <Scale className="h-3 w-3 me-1" />;
    case 'NEW_LAW':
      return <FileText className="h-3 w-3 me-1" />;
    default:
      return null;
  }
}

function getChangeTypeLabel(changeType: ChangeType) {
  const option = CHANGE_TYPE_OPTIONS.find((c) => c.value === changeType);
  return option?.label || changeType;
}

export default function IntelligencePage() {
  const t = useTranslations('intelligence');
  const tCommon = useTranslations('common');

  const [activeTab, setActiveTab] = useState<'all' | 'personalized'>('personalized');
  const [regulationFilter, setRegulationFilter] = useState<string>('ALL');
  const [changeTypeFilter, setChangeTypeFilter] = useState<string>('ALL');

  const { data, isLoading, error, refetch } = trpc.intelligence.list.useQuery({
    limit: 20,
    personalized: activeTab === 'personalized',
    ...(regulationFilter !== 'ALL' && regulationFilter && {
      regulation: regulationFilter as any,
    }),
    ...(changeTypeFilter !== 'ALL' && changeTypeFilter && {
      changeType: changeTypeFilter as ChangeType,
    }),
  });

  const { data: unreadData } = trpc.intelligence.getUnreadCount.useQuery({
    personalized: activeTab === 'personalized',
  });

  const markAsReadMutation = trpc.intelligence.markAsRead.useMutation({
    onSuccess: () => { refetch(); },
  });

  const markAllAsReadMutation = trpc.intelligence.markAllAsRead.useMutation({
    onSuccess: () => { refetch(); },
  });

  const utils = trpc.useUtils();

  const handleMarkAsRead = async (id: string) => {
    await markAsReadMutation.mutateAsync({ id });
    utils.intelligence.getUnreadCount.invalidate();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
    utils.intelligence.getUnreadCount.invalidate();
  };

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

  const updates = data?.updates || [];
  const hasFullAccess = data?.hasFullAccess ?? false;
  const unreadCount = unreadData?.unread ?? 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-slate-400 mt-1">{t('description')}</p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {t('markAllRead')}
            </button>
          )}
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            {t('refresh')}
          </button>
        </div>
      </div>

      {/* Tabs + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Tab toggle */}
        <div className="flex rounded-lg border border-slate-700/60 bg-slate-800/60 p-1">
          <button
            onClick={() => setActiveTab('personalized')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'personalized'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {t('personalizedTab')}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {t('allTab')}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">{t('filterByRegulation')}:</span>
            <select
              value={regulationFilter}
              onChange={(e) => setRegulationFilter(e.target.value)}
              className="rounded-lg border border-slate-600/60 bg-slate-700/50 px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50"
            >
              {REGULATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">{t('filterByType')}:</span>
            <select
              value={changeTypeFilter}
              onChange={(e) => setChangeTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-600/60 bg-slate-700/50 px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50"
            >
              {CHANGE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Updates list */}
      <UpdatesList
        updates={updates}
        hasFullAccess={hasFullAccess}
        t={t}
        onMarkAsRead={handleMarkAsRead}
        isMarkingRead={markAsReadMutation.isPending}
      />
    </div>
  );
}

interface UpdatesListProps {
  updates: Array<{
    id: string;
    title: string;
    summary: string | null;
    source: string | null;
    regulation: string;
    changeType: ChangeType;
    impact: string | null;
    affectedArticles: string[];
    publishedAt: Date;
    isRead: boolean;
  }>;
  hasFullAccess: boolean;
  t: ReturnType<typeof useTranslations<'intelligence'>>;
  onMarkAsRead: (id: string) => void;
  isMarkingRead: boolean;
}

function UpdatesList({ updates, hasFullAccess, t, onMarkAsRead, isMarkingRead }: UpdatesListProps) {
  if (updates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-16 text-center bg-slate-800/20">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
          <Bell className="h-8 w-8 text-slate-600" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-white">{t('noUpdates')}</h3>
        <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">{t('noUpdatesDescription')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {updates.map((update) => (
        <div
          key={update.id}
          className={`rounded-xl border p-5 transition-colors ${
            !update.isRead
              ? 'border-emerald-500/20 bg-emerald-500/5'
              : 'border-slate-600/60 bg-slate-800/60'
          }`}
        >
          <div className="flex items-start gap-4">
            {/* Unread dot */}
            <div className="mt-2 flex-shrink-0">
              <div
                className={`h-2 w-2 rounded-full ${!update.isRead ? 'bg-emerald-400' : 'bg-transparent'}`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getRegulationBadgeClasses(update.regulation)}`}>
                  {getRegulationLabel(update.regulation)}
                </span>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getChangeTypeBadgeClasses(update.changeType)}`}>
                  {getChangeTypeIcon(update.changeType)}
                  {getChangeTypeLabel(update.changeType)}
                </span>
                {update.affectedArticles.length > 0 && (
                  <span className="text-xs text-slate-500">
                    {update.affectedArticles.join(', ')}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-base text-white">{update.title}</h3>

              {/* Summary */}
              {hasFullAccess ? (
                <>
                  {update.summary && (
                    <p className="mt-2 text-sm text-slate-400 line-clamp-3">{update.summary}</p>
                  )}
                  {update.impact && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-700/40 border-s-2 border-emerald-500/50">
                      <p className="text-sm text-slate-300">
                        <span className="font-medium text-white">{t('impact')}:</span>{' '}
                        {update.impact}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Lock className="h-4 w-4" />
                  <span>{t('upgradeToPlan')}</span>
                  <Link href="/pricing" className="text-emerald-400 hover:text-emerald-300">
                    {t('upgradeLink')}
                  </Link>
                </div>
              )}

              {/* Footer */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {format(new Date(update.publishedAt), 'MMM d, yyyy')}
                </span>

                <div className="flex items-center gap-2">
                  {!update.isRead && (
                    <button
                      onClick={() => onMarkAsRead(update.id)}
                      disabled={isMarkingRead}
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {t('markRead')}
                    </button>
                  )}
                  {hasFullAccess && update.source && (
                    <a
                      href={update.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 transition-colors"
                    >
                      {t('viewSource')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
