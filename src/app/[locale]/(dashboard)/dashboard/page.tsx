'use client';

import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, TrendingUp, Shield, Clock, ArrowRight, Bell } from 'lucide-react';

function getComplianceScoreColor(score: number | null) {
  if (score === null) return 'text-slate-500';
  if (score < 40) return 'text-red-400';
  if (score < 70) return 'text-yellow-400';
  return 'text-emerald-400';
}

function getRiskLevelColor(riskLevel: string) {
  switch (riskLevel) {
    case 'UNACCEPTABLE':
      return 'border-red-500/30 bg-red-500/10 text-red-400';
    case 'HIGH':
      return 'border-orange-500/30 bg-orange-500/10 text-orange-400';
    case 'LIMITED':
      return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
    case 'MINIMAL':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
    default:
      return 'border-slate-700/50 bg-slate-800/50 text-slate-400';
  }
}

function getRiskLevelIcon(riskLevel: string) {
  switch (riskLevel) {
    case 'UNACCEPTABLE':
      return <AlertCircle className="h-6 w-6" />;
    case 'HIGH':
      return <AlertCircle className="h-6 w-6" />;
    case 'LIMITED':
      return <Clock className="h-6 w-6" />;
    case 'MINIMAL':
      return <CheckCircle2 className="h-6 w-6" />;
    default:
      return <Shield className="h-6 w-6" />;
  }
}

// Calculate days until EU AI Act deadline (August 2, 2026)
function getDaysUntilDeadline() {
  const deadline = new Date('2026-08-02');
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tClass = useTranslations('classification');
  const tCommon = useTranslations('common');
  const router = useRouter();

  // Fetch dashboard stats
  const { data: stats, isLoading } = trpc.system.getStats.useQuery();

  // Fetch critical gaps (top 5)
  const { data: systems } = trpc.system.list.useQuery({ limit: 50 });

  // Fetch latest regulatory updates
  const { data: latestUpdates } = trpc.intelligence.getLatest.useQuery({ limit: 3 });

  const daysUntilDeadline = getDaysUntilDeadline();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-medium text-slate-300">{tCommon('loading')}</div>
        </div>
      </div>
    );
  }

  const hasData = stats && stats.totalSystems > 0;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <p className="text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Systems */}
        <div className="rounded-xl bg-slate-800/60 border border-slate-600/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-400">
                {t('totalSystems')}
              </div>
              <div className="mt-2 text-3xl font-bold text-white">
                {stats?.totalSystems || 0}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {stats?.classifiedSystems || 0} {t('classified')}
              </div>
            </div>
            <Shield className="h-8 w-8 text-slate-500" />
          </div>
        </div>

        {/* Compliance Score */}
        <div className="rounded-xl bg-slate-800/60 border border-slate-600/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-400">
                {t('complianceScore')}
              </div>
              <div
                className={`mt-2 text-3xl font-bold ${getComplianceScoreColor(stats?.avgComplianceScore || null)}`}
              >
                {stats?.avgComplianceScore !== null && stats?.avgComplianceScore !== undefined
                  ? `${stats.avgComplianceScore}%`
                  : '-'}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {t('average')}
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-slate-500" />
          </div>
          {stats?.avgComplianceScore !== null && stats?.avgComplianceScore !== undefined && (
            <Progress value={stats.avgComplianceScore} className="mt-3 h-2" />
          )}
        </div>

        {/* Critical Gaps */}
        <div className="rounded-xl bg-slate-800/60 border border-slate-600/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-400">
                {t('criticalGaps')}
              </div>
              <div className={`mt-2 text-3xl font-bold ${stats?.criticalGaps && stats.criticalGaps > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {stats?.criticalGaps || 0}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {t('requiresAttention')}
              </div>
            </div>
            <AlertCircle className={`h-8 w-8 ${stats?.criticalGaps && stats.criticalGaps > 0 ? 'text-red-400' : 'text-slate-500'}`} />
          </div>
        </div>

        {/* Deadline Countdown */}
        <div className="rounded-xl bg-slate-800/60 border border-emerald-500/30 p-6 shadow-[0_0_20px_rgba(16,185,129,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-400">
                {t('euAiActDeadline')}
              </div>
              <div className="mt-2 text-3xl font-bold text-emerald-400">{daysUntilDeadline}</div>
              <div className="mt-1 text-xs text-slate-400">
                {t('daysRemaining')}
              </div>
            </div>
            <Clock className="h-8 w-8 text-emerald-400/60" />
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      {hasData && (
        <div>
          <h2 className="text-lg font-semibold text-white">{t('riskDistribution')}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(['UNACCEPTABLE', 'HIGH', 'LIMITED', 'MINIMAL'] as const).map((riskLevel) => {
              const count = stats?.riskDistribution[riskLevel] || 0;
              return (
                <div
                  key={riskLevel}
                  className={`rounded-xl border p-4 ${getRiskLevelColor(riskLevel)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getRiskLevelIcon(riskLevel)}
                      <div>
                        <div className="text-sm font-medium">
                          {tClass(riskLevel.toLowerCase())}
                        </div>
                        <div className="text-2xl font-bold">{count}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Critical Gaps List */}
      {hasData && systems && systems.systems.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('topCriticalGaps')}</h2>
          </div>
          <div className="mt-4 space-y-3">
            {systems.systems
              .filter((s: any) => s.gaps.length > 0)
              .slice(0, 5)
              .flatMap((system: any) =>
                system.gaps
                  .filter((gap: any) => gap.priority === 'CRITICAL' && gap.status !== 'COMPLETED')
                  .slice(0, 1)
                  .map((gap: any) => ({
                    gap,
                    systemId: system.id,
                    systemName: system.name,
                  }))
              )
              .slice(0, 5)
              .map(({ gap, systemId, systemName }: any) => (
                <div key={gap.id} className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <span className="font-medium text-white">{gap.article}</span>
                        <Badge variant="destructive">{gap.priority}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        {gap.requirement}
                      </p>
                      <div className="mt-2 text-xs text-slate-400">
                        {t('system')}: {systemName}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={() =>
                        router.push(`/systems/${systemId}/gaps`)
                      }
                    >
                      {t('viewGaps')}
                      <ArrowRight className="ms-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            {systems.systems.filter((s: any) => s.gaps.length > 0).length === 0 && (
              <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
                <div className="mt-4 text-lg font-semibold text-white">{t('noCriticalGaps')}</div>
                <div className="text-sm text-slate-400">
                  {t('noCriticalGapsDescription')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Latest Regulatory Updates */}
      {latestUpdates && latestUpdates.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('latestUpdates')}</h2>
            <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300" asChild>
              <Link href="/intelligence">
                {t('viewAll')}
                <ArrowRight className="ms-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {latestUpdates.map((update) => (
              <div key={update.id} className={`rounded-xl p-4 border ${!update.isRead ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-700/50 bg-slate-800/50'}`}>
                <div className="flex items-start gap-3">
                  {!update.isRead && (
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                        {update.regulation.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Link
                      href="/intelligence"
                      className="font-medium text-white hover:underline line-clamp-1"
                    >
                      {update.title}
                    </Link>
                    <div className="mt-1 text-xs text-slate-400">
                      {new Date(update.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Bell className="h-4 w-4 text-slate-600 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state — Onboarding */}
      {!hasData && (
        <div className="space-y-6">
          {/* Welcome banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 p-8">
            <div className="absolute top-0 end-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👋</span>
                <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Welcome to Complyance</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Get compliant fast.
              </h2>
              <p className="text-slate-400 max-w-lg">
                You&apos;re {daysUntilDeadline} days away from the deadline. Complete these steps to protect your business from fines up to €35M.
              </p>
            </div>
          </div>

          {/* Onboarding steps */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Step 1 */}
            <button
              onClick={() => router.push('/systems/new')}
              className="group relative text-start rounded-xl bg-slate-800/60 border border-slate-700/50 p-6 hover:border-emerald-500/40 hover:bg-slate-800/80 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm group-hover:bg-emerald-500/20 transition-colors">
                  1
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-semibold text-white mb-1">Add your AI system</h3>
              <p className="text-sm text-slate-400">Describe your AI system and get instant risk classification under EU AI Act Annex III.</p>
              <div className="mt-4 text-xs font-medium text-emerald-400">
                Start here →
              </div>
            </button>

            {/* Step 2 */}
            <div className="relative text-start rounded-xl bg-slate-800/40 border border-slate-700/30 p-6 opacity-60">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 border border-slate-700 flex items-center justify-center text-slate-500 font-bold text-sm">
                  2
                </div>
                <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                </div>
              </div>
              <h3 className="font-semibold text-slate-300 mb-1">Review compliance gaps</h3>
              <p className="text-sm text-slate-500">See exactly which Articles 9–15 obligations apply to your system with a prioritized action plan.</p>
              <div className="mt-4 text-xs font-medium text-slate-600">
                Unlocks after Step 1
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative text-start rounded-xl bg-slate-800/40 border border-slate-700/30 p-6 opacity-60">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 border border-slate-700 flex items-center justify-center text-slate-500 font-bold text-sm">
                  3
                </div>
                <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                </div>
              </div>
              <h3 className="font-semibold text-slate-300 mb-1">Generate documentation</h3>
              <p className="text-sm text-slate-500">Export audit-ready PDF reports including Technical Documentation (Annex IV) and Compliance Roadmap.</p>
              <div className="mt-4 text-xs font-medium text-slate-600">
                Unlocks after Step 2
              </div>
            </div>
          </div>

          {/* Quick resources */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Deadline card */}
            <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-2xl font-black text-emerald-400 leading-none">{daysUntilDeadline}</span>
                <span className="text-[10px] text-emerald-500/70 uppercase tracking-wide mt-0.5">days</span>
              </div>
              <div>
                <div className="font-semibold text-white mb-1">EU AI Act Deadline</div>
                <div className="text-sm text-slate-400">August 2, 2026 — High-risk AI systems must be fully compliant.</div>
              </div>
            </div>

            {/* Free classifier */}
            <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="h-7 w-7 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white mb-1">Not sure about your risk level?</div>
                <div className="text-sm text-slate-400 mb-3">Try our free classifier — no account needed.</div>
                <Link href="/free-classifier" className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                  Try Free Classifier →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
