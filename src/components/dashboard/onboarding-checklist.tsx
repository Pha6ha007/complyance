'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Circle,
  Lock,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Lightbulb,
  Rocket,
  PartyPopper,
  Server,
  BarChart3,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface Step {
  key: string;
  icon: React.ReactNode;
  href: string;
  getDynamicHref?: (systemId: string | null) => string;
}

const STEPS: Step[] = [
  {
    key: 'step1',
    icon: <Server className="h-4 w-4" />,
    href: '/systems/new',
  },
  {
    key: 'step2',
    icon: <BarChart3 className="h-4 w-4" />,
    href: '/systems',
    getDynamicHref: (systemId) => systemId ? `/systems/${systemId}` : '/systems',
  },
  {
    key: 'step3',
    icon: <AlertTriangle className="h-4 w-4" />,
    href: '/systems',
    getDynamicHref: (systemId) => systemId ? `/systems/${systemId}/gaps` : '/systems',
  },
  {
    key: 'step4',
    icon: <FileText className="h-4 w-4" />,
    href: '/reports',
  },
];

function getStepCompleted(stepIndex: number, steps: {
  systemAdded: boolean;
  classificationDone: boolean;
  gapsReviewed: boolean;
  reportGenerated: boolean;
}) {
  switch (stepIndex) {
    case 0: return steps.systemAdded;
    case 1: return steps.classificationDone;
    case 2: return steps.gapsReviewed;
    case 3: return steps.reportGenerated;
    default: return false;
  }
}

export function OnboardingChecklist() {
  const t = useTranslations('onboarding');
  const router = useRouter();
  const pathname = usePathname();

  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  const { data: onboarding, isLoading } = trpc.system.getOnboardingStatus.useQuery(
    undefined,
    { refetchInterval: 5000 }
  );

  const completeOnboarding = trpc.system.completeOnboarding.useMutation();

  // Find current step (first incomplete)
  const completedSteps = onboarding?.steps
    ? [
        onboarding.steps.systemAdded,
        onboarding.steps.classificationDone,
        onboarding.steps.gapsReviewed,
        onboarding.steps.reportGenerated,
      ]
    : [false, false, false, false];

  const completedCount = completedSteps.filter(Boolean).length;
  const currentStepIndex = completedSteps.findIndex((done) => !done);
  const allDone = completedCount === 4;

  // Auto-expand current step
  useEffect(() => {
    if (currentStepIndex >= 0 && expandedStep === null) {
      setExpandedStep(currentStepIndex);
    }
  }, [currentStepIndex, expandedStep]);

  // Show celebration when all done
  useEffect(() => {
    if (allDone && !showComplete && !onboarding?.completed) {
      setShowComplete(true);
      completeOnboarding.mutate();
    }
  }, [allDone, showComplete, onboarding?.completed, completeOnboarding]);

  // Don't show if already completed, dismissed, or loading
  if (isLoading || onboarding?.completed || dismissed) {
    return null;
  }

  // Minimized floating button
  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 end-6 z-40 flex items-center gap-2 rounded-full
          bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white
          shadow-lg shadow-emerald-500/25 hover:bg-emerald-400
          transition-all hover:scale-105 active:scale-95"
      >
        <Rocket className="h-4 w-4" />
        <span>{t('showOnboarding')}</span>
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/20 px-1.5 text-xs font-bold">
          {completedCount}/4
        </span>
      </button>
    );
  }

  // Celebration state
  if (showComplete) {
    return (
      <div className="fixed bottom-6 end-6 z-40 w-80 animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="rounded-2xl bg-slate-800/95 backdrop-blur-sm border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-6 text-center">
            <PartyPopper className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">{t('complete')}</h3>
            <p className="text-sm text-slate-300 mt-1">{t('completeDescription')}</p>
          </div>
          <div className="p-4">
            <button
              onClick={() => setDismissed(true)}
              className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold
                text-white hover:bg-emerald-400 transition-colors"
            >
              {t('gotIt')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 end-6 z-40 w-80 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="rounded-2xl bg-slate-800/95 backdrop-blur-sm border border-slate-700/60 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/25">
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{t('title')}</h3>
              <p className="text-xs text-slate-400">
                {t('progress', { completed: String(completedCount), total: '4' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized(true)}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              title={t('minimize')}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              title={t('dismiss')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 pt-3 pb-1">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors duration-500',
                  completedSteps[i]
                    ? 'bg-emerald-500'
                    : i === currentStepIndex
                      ? 'bg-emerald-500/30'
                      : 'bg-slate-700'
                )}
              />
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="px-3 py-3 space-y-1">
          {STEPS.map((step, index) => {
            const isComplete = completedSteps[index];
            const isCurrent = index === currentStepIndex;
            const isLocked = index > currentStepIndex && !isComplete;
            const isExpanded = expandedStep === index;

            return (
              <div key={step.key}>
                {/* Step row */}
                <button
                  onClick={() => {
                    if (isLocked) return;
                    setExpandedStep(isExpanded ? null : index);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-all',
                    isComplete
                      ? 'text-emerald-400/80 hover:bg-slate-700/30'
                      : isCurrent
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-white'
                        : isLocked
                          ? 'text-slate-500 cursor-not-allowed'
                          : 'text-slate-300 hover:bg-slate-700/30'
                  )}
                >
                  {/* Status icon */}
                  <div className="flex-shrink-0">
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : isLocked ? (
                      <Lock className="h-5 w-5 text-slate-600" />
                    ) : (
                      <div className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs font-bold',
                        isCurrent
                          ? 'border-emerald-500 text-emerald-400'
                          : 'border-slate-600 text-slate-500'
                      )}>
                        {index + 1}
                      </div>
                    )}
                  </div>

                  {/* Step title */}
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'text-sm font-medium truncate',
                      isComplete && 'line-through decoration-emerald-500/40'
                    )}>
                      {t(`${step.key}Title`)}
                    </div>
                  </div>

                  {/* Step icon */}
                  <div className={cn(
                    'flex-shrink-0',
                    isComplete ? 'text-emerald-400/50' : isCurrent ? 'text-emerald-400' : 'text-slate-600'
                  )}>
                    {step.icon}
                  </div>

                  {/* Expand indicator */}
                  {!isLocked && (
                    <ChevronUp className={cn(
                      'h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200',
                      isComplete ? 'text-emerald-400/30' : 'text-slate-500',
                      !isExpanded && 'rotate-180'
                    )} />
                  )}
                </button>

                {/* Expanded details */}
                {isExpanded && !isLocked && (
                  <div className="ms-11 me-2 mt-1 mb-2 animate-in slide-in-from-top-1 fade-in duration-200">
                    <p className="text-xs text-slate-400 mb-2">
                      {t(`${step.key}Description`)}
                    </p>

                    {/* Hint */}
                    <div className="flex items-start gap-2 rounded-lg bg-slate-700/30 border border-slate-700/40 p-2.5 mb-3">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-400/70 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {t(`${step.key}Hint`)}
                      </p>
                    </div>

                    {/* Action button */}
                    {!isComplete && (
                      <button
                        onClick={() => {
                          const href = step.getDynamicHref
                            ? step.getDynamicHref(onboarding?.firstSystemId ?? null)
                            : step.href;
                          router.push(href);
                        }}
                        className={cn(
                          'w-full rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                          isCurrent
                            ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        )}
                      >
                        {t(`${step.key}Action`)}
                      </button>
                    )}

                    {isComplete && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400/70">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t('stepComplete')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Subtitle */}
        <div className="px-5 pb-4">
          <p className="text-xs text-slate-500 text-center">
            {t('subtitle')}
          </p>
        </div>
      </div>
    </div>
  );
}
