'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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

function getPriorityBadgeVariant(priority: Priority) {
  switch (priority) {
    case 'CRITICAL':
      return 'destructive';
    case 'HIGH':
      return 'default';
    case 'MEDIUM':
      return 'secondary';
    case 'LOW':
      return 'outline';
  }
}

function getStatusIcon(status: GapStatus) {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'IN_PROGRESS':
      return <Clock className="h-5 w-5 text-yellow-600" />;
    case 'NOT_STARTED':
      return <Circle className="h-5 w-5 text-gray-400" />;
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
          <div className="text-lg font-medium">{tCommon('loading')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <div className="mt-4 text-lg font-medium">{tCommon('error')}</div>
          <div className="text-sm text-muted-foreground">{error.message}</div>
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
          onClick={() => router.push(`/${locale}/systems/${systemId}`)}
        >
          <ArrowLeft className="me-2 h-4 w-4" />
          {t('backToSystem')}
        </Button>

        <div className="mt-4">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          {system && (
            <p className="mt-1 text-muted-foreground">
              {t('subtitle')} {system.name}
            </p>
          )}
        </div>
      </div>

      {/* Progress card */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {t('overallProgress')}
              </div>
              <div className="mt-1 text-2xl font-bold">
                {completedGaps} {t('of')} {totalGaps} {t('completed')}
              </div>
            </div>
            <div className="text-end">
              <div className="text-3xl font-bold">{Math.round(progressPercentage)}%</div>
              <div className="text-sm text-muted-foreground">{t('complete')}</div>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-[200px]">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as GapStatus | 'ALL')}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
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
            <SelectTrigger>
              <SelectValue placeholder={t('filterByPriority')} />
            </SelectTrigger>
            <SelectContent>
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
            <Card
              key={gap.id}
              className={`p-4 transition-all ${
                gap.status === 'COMPLETED' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Status checkbox */}
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
                        <span className="font-medium">{gap.article}</span>
                        <Badge variant={getPriorityBadgeVariant(gap.priority)}>
                          {gap.priority}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {gap.requirement}
                      </p>
                    </div>

                    <Badge
                      variant={
                        gap.status === 'COMPLETED'
                          ? 'default'
                          : gap.status === 'IN_PROGRESS'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {gap.status === 'COMPLETED'
                        ? t('completed')
                        : gap.status === 'IN_PROGRESS'
                          ? t('inProgress')
                          : t('notStarted')}
                    </Badge>
                  </div>

                  {gap.notes && (
                    <div className="rounded-md bg-muted p-2 text-sm">
                      <span className="font-medium">{t('notes')}: </span>
                      {gap.notes}
                    </div>
                  )}

                  {gap.dueDate && (
                    <div className="text-xs text-muted-foreground">
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
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <div className="mt-4 text-lg font-medium">{t('noGaps')}</div>
            <div className="text-sm text-muted-foreground">{t('noGapsDescription')}</div>
          </Card>
        )}
      </div>
    </div>
  );
}
