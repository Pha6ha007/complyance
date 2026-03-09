'use client';

import Link from 'next/link';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  Bell,
  BookOpen,
  FileText,
  Gavel,
  Lock,
  PenTool,
  RefreshCw,
  Scale,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { formatDistance, format } from 'date-fns';
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

function getRegulationBadgeColor(regulation: string) {
  switch (regulation) {
    case 'EU_AI_ACT':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'COLORADO':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'NYC_LL144':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'NIST_RMF':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'ISO_42001':
      return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    case 'UAE_AI':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

function getRegulationLabel(regulation: string) {
  const option = REGULATION_OPTIONS.find((r) => r.value === regulation);
  return option?.label || regulation;
}

function getChangeTypeBadgeVariant(changeType: ChangeType) {
  switch (changeType) {
    case 'ENFORCEMENT':
      return 'destructive';
    case 'NEW_LAW':
      return 'default';
    case 'AMENDMENT':
      return 'secondary';
    default:
      return 'outline';
  }
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
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('intelligence');
  const tCommon = useTranslations('common');

  const [activeTab, setActiveTab] = useState<'all' | 'personalized'>('personalized');
  const [regulationFilter, setRegulationFilter] = useState<string>('ALL');
  const [changeTypeFilter, setChangeTypeFilter] = useState<string>('ALL');

  // Fetch updates
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

  // Get unread count
  const { data: unreadData } = trpc.intelligence.getUnreadCount.useQuery({
    personalized: activeTab === 'personalized',
  });

  // Mark as read mutation
  const markAsReadMutation = trpc.intelligence.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = trpc.intelligence.markAllAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-medium">{tCommon('loading')}</div>
          <div className="text-sm text-muted-foreground">
            {t('loadingDescription')}
          </div>
        </div>
      </div>
    );
  }

  // Error state
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

  const updates = data?.updates || [];
  const hasFullAccess = data?.hasFullAccess ?? false;
  const unreadCount = unreadData?.unread ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCircle2 className="me-2 h-4 w-4" />
              {t('markAllRead')}
            </Button>
          )}
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="me-2 h-4 w-4" />
            {t('refresh')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'personalized')}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="personalized">
              {t('personalizedTab')}
            </TabsTrigger>
            <TabsTrigger value="all">
              {t('allTab')}
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Regulation filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('filterByRegulation')}:</span>
              <Select value={regulationFilter} onValueChange={setRegulationFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder={t('allRegulations')} />
                </SelectTrigger>
                <SelectContent>
                  {REGULATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Change type filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('filterByType')}:</span>
              <Select value={changeTypeFilter} onValueChange={setChangeTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t('allTypes')} />
                </SelectTrigger>
                <SelectContent>
                  {CHANGE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <TabsContent value="personalized" className="mt-6">
          <UpdatesList
            updates={updates}
            hasFullAccess={hasFullAccess}
            locale={locale}
            t={t}
            onMarkAsRead={handleMarkAsRead}
            isMarkingRead={markAsReadMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <UpdatesList
            updates={updates}
            hasFullAccess={hasFullAccess}
            locale={locale}
            t={t}
            onMarkAsRead={handleMarkAsRead}
            isMarkingRead={markAsReadMutation.isPending}
          />
        </TabsContent>
      </Tabs>
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
  locale: string;
  t: ReturnType<typeof useTranslations<'intelligence'>>;
  onMarkAsRead: (id: string) => void;
  isMarkingRead: boolean;
}

function UpdatesList({
  updates,
  hasFullAccess,
  locale,
  t,
  onMarkAsRead,
  isMarkingRead,
}: UpdatesListProps) {
  if (updates.length === 0) {
    return (
      <div className="rounded-lg border p-12 text-center">
        <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">{t('noUpdates')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('noUpdatesDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <Card
          key={update.id}
          className={`p-5 transition-colors ${!update.isRead ? 'border-primary/50 bg-primary/5' : ''}`}
        >
          <div className="flex items-start gap-4">
            {/* Unread indicator */}
            <div className="mt-1.5">
              {!update.isRead && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary" title={t('unread')} />
              )}
              {update.isRead && (
                <div className="h-2.5 w-2.5 rounded-full bg-transparent" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getRegulationBadgeColor(update.regulation)}`}
                >
                  {getRegulationLabel(update.regulation)}
                </span>
                <Badge variant={getChangeTypeBadgeVariant(update.changeType)}>
                  {getChangeTypeIcon(update.changeType)}
                  {getChangeTypeLabel(update.changeType)}
                </Badge>
                {update.affectedArticles.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {update.affectedArticles.join(', ')}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-base">{update.title}</h3>

              {/* Summary - gated for Free plan */}
              {hasFullAccess ? (
                <>
                  {update.summary && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {update.summary}
                    </p>
                  )}
                  {update.impact && (
                    <div className="mt-3 p-3 rounded-md bg-muted/50 border-s-4 border-primary">
                      <p className="text-sm">
                        <span className="font-medium">{t('impact')}:</span> {update.impact}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>{t('upgradeToPlan')}</span>
                  <Link
                    href={`/${locale}/pricing`}
                    className="text-primary hover:underline"
                  >
                    {t('upgradeLink')}
                  </Link>
                </div>
              )}

              {/* Footer */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(update.publishedAt), 'MMM d, yyyy')}
                </span>

                <div className="flex items-center gap-2">
                  {!update.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsRead(update.id)}
                      disabled={isMarkingRead}
                    >
                      <CheckCircle2 className="me-1 h-3 w-3" />
                      {t('markRead')}
                    </Button>
                  )}
                  {hasFullAccess && update.source && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={update.source} target="_blank" rel="noopener noreferrer">
                        {t('viewSource')}
                        <ExternalLink className="ms-1 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
