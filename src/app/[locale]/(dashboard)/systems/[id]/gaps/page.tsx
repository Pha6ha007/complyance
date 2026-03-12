'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc/client';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, AlertCircle, CheckCircle2, Clock, Circle } from 'lucide-react';
import { GapStatus, Priority } from '@prisma/client';

function getPriorityBadgeClasses(priority: Priority): string {
  switch (priority) {
    case 'CRITICAL':
      return 'bg-red-500/10 text-red-400 border border-red-500/20';
    case 'HIGH':
      return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    case 'MEDIUM':
      return 'bg-amber-400/10 text-amber-400 border border-amber-400/20';
    case 'LOW':
      return 'bg-slate-700/50 text-slate-400 border border-slate-600/50';
  }
}

function getStatusBadgeClasses(status: GapStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20';
    case 'IN_PROGRESS':
      return 'bg-amber-400/10 text-amber-400 border border-amber-400/20';
    case 'NOT_STARTED':
      return 'bg-slate-700/50 text-slate-400 border border-slate-600/50';
  }
}

function getStatusIcon(status: GapStatus) {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
    case 'IN_PROGRESS':
      return <Clock className="h-5 w-5 text-amber-400" />;
    case 'NOT_STARTED':
      return <Circle className="h-5 w-5 text-slate-500" />;
  }
}

export default function GapsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const systemId = params.id as string;

  const t = useTranslations('gaps');
  const tCommon = useTranslations('common');

  const [statusFilter, setStatusFilter] = useState<GapStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');

  // Fetch system info
  const { data: system } = trpc.system.getById.useQuery({ id: systemId });

  // Fetch gaps with filters
  const { data: gaps, isLoading, error, refetch } = trpc.classification.getGaps.useQuery({
    systemId,
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
    ...(priorityFilter !== 'ALL' && { priority: priorityFilter }),
  });

  // Update gap status mutation
  const updateStatusMutation = trpc.classification.updateGapStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleStatusToggle = (gapId: string, currentStatus: GapStatus) => {
    const nextStatus: GapStatus =
      currentStatus === 'NOT_STARTED'
        ? 'IN_PROGRESS'
        : currentStatus === 'IN_PROGRESS'
          ? 'COMPLETED'
          : 'NOT_STARTED';

    updateStatusMutation.mutate({ gapId, status: nextStatus });
  };

  // Calculate progress
  const totalGaps = gaps?.length || 0;
  const completedGaps = gaps?.filter((g) => g.status === 'COMPLETED').length || 0;
  const progressPercentage = totalGaps > 0 ? (completedGaps / totalGaps) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-medium text-slate-300">{tCommon('loading')}</div>
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push(`/systems/${systemId}`)}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToSystem')}
        </button>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          {system && (
            <p className="mt-1 text-slate-400">
              {t('subtitle')} {system.name}
            </p>
          )}
        </div>
      </div>

      {/* Progress card */}
      <div className="rounded-xl bg-slate-800/60 border border-slate-600/60 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-400">
                {t('overallProgress')}
              </div>
              <div className="mt-1 text-2xl font-bold text-white">
                {completedGaps} {t('of')} {totalGaps} {t('completed')}
              </div>
            </div>
            <div className="text-end">
              <div className="text-3xl font-bold text-emerald-400">{Math.round(progressPercentage)}%</div>
              <div className="text-sm text-slate-400">{t('complete')}</div>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-[200px]">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as GapStatus | 'ALL')}
          >
            <SelectTrigger className="bg-slate-800/60 border-slate-600/60 text-slate-300">
              <SelectValue placeholder={t('filterByStatus')} />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="ALL">{t('allStatuses')}</SelectItem>
              <SelectItem value="NOT_STARTED">{t('notStarted')}</SelectItem>
              <SelectItem value="IN_PROGRESS">{t('inProgress')}</SelectItem>
              <SelectItem value="COMPLETED">{t('completed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[200px]">
          <Select
            value={priorityFilter}
            onValueChange={(value) => setPriorityFilter(value as Priority | 'ALL')}
          >
            <SelectTrigger className="bg-slate-800/60 border-slate-600/60 text-slate-300">
              <SelectValue placeholder={t('filterByPriority')} />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="ALL">{t('allPriorities')}</SelectItem>
              <SelectItem value="CRITICAL">{t('critical')}</SelectItem>
              <SelectItem value="HIGH">{t('high')}</SelectItem>
              <SelectItem value="MEDIUM">{t('medium')}</SelectItem>
              <SelectItem value="LOW">{t('low')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gaps list */}
      <div className="space-y-3">
        {gaps && gaps.length > 0 ? (
          gaps.map((gap) => (
            <div
              key={gap.id}
              className={`rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 transition-all ${
                gap.status === 'COMPLETED' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Status toggle */}
                <button
                  onClick={() => handleStatusToggle(gap.id, gap.status)}
                  className="mt-1 flex-shrink-0"
                  disabled={updateStatusMutation.isPending}
                >
                  {getStatusIcon(gap.status)}
                </button>

                {/* Gap content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{gap.article}</span>
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getPriorityBadgeClasses(gap.priority)}`}>
                          {gap.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        {gap.requirement}
                      </p>
                    </div>

                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ${getStatusBadgeClasses(gap.status)}`}>
                      {gap.status === 'COMPLETED'
                        ? t('completed')
                        : gap.status === 'IN_PROGRESS'
                          ? t('inProgress')
                          : t('notStarted')}
                    </span>
                  </div>

                  {gap.notes && (
                    <div className="rounded-lg bg-slate-700/50 p-2 text-sm text-slate-300">
                      <span className="font-medium text-slate-200">{t('notes')}: </span>
                      {gap.notes}
                    </div>
                  )}

                  {gap.dueDate && (
                    <div className="text-xs text-slate-500">
                      {t('dueDate')}:{' '}
                      {new Date(gap.dueDate).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <div className="mt-4 text-lg font-medium text-white">{t('noGaps')}</div>
            <div className="text-sm text-slate-400">{t('noGapsDescription')}</div>
          </div>
        )}
      </div>
    </div>
  );
}
