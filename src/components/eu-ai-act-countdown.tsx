'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, AlertTriangle } from 'lucide-react';

/**
 * EU AI Act high-risk obligations enter into application on 2 August 2026.
 * Reference: Regulation (EU) 2024/1689, Article 113.
 *
 * This is the canonical countdown component for the deadline. Use it
 * anywhere — navbar pills, marketing hero sections, blog post headers,
 * dashboard banners — and the urgency tier (color) is computed from the
 * remaining days, not hard-coded.
 *
 * Tiers:
 *  - emerald: > 180 days  (calm)
 *  - amber:   90–180 days (heads up)
 *  - red:     < 90 days   (urgent)
 *  - red:     0 days      (deadline reached / passed — deadline holds)
 *
 * Variants:
 *  - "pill":   compact badge for navbars / hero sections
 *  - "card":   large block with days/hours/minutes for landing pages
 *  - "inline": just the day count, for embedding inside paragraphs
 *
 * SSR-safe: server renders a stable fallback (the static deadline label
 * for pill, dashes for card/inline). The first useEffect on the client
 * computes real values, so there is no hydration mismatch on the dynamic
 * digits.
 */

export const EU_AI_ACT_DEADLINE_ISO = '2026-08-02T00:00:00Z';

export type CountdownVariant = 'pill' | 'card' | 'inline';

type Tier = 'calm' | 'warn' | 'urgent';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTier(days: number | null): Tier {
  if (days === null) return 'calm';
  if (days < 90) return 'urgent';
  if (days < 180) return 'warn';
  return 'calm';
}

function computeRemaining(): TimeRemaining {
  const ms = Math.max(0, new Date(EU_AI_ACT_DEADLINE_ISO).getTime() - Date.now());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  return { days, hours, minutes, seconds };
}

export interface EUAIActCountdownProps {
  /**
   * Visual variant. Default: "pill".
   */
  variant?: CountdownVariant;
  /**
   * Optional className appended to the root element. Useful for layout
   * overrides without forking the component.
   */
  className?: string;
}

export function EUAIActCountdown({
  variant = 'pill',
  className = '',
}: EUAIActCountdownProps) {
  const t = useTranslations('countdown');

  // `null` on first render → SSR/CSR mismatch is impossible because both
  // server and client emit the same fallback markup. We replace with real
  // numbers in useEffect.
  const [remaining, setRemaining] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    setRemaining(computeRemaining());
    // Refresh cadence depends on variant: card shows seconds → 1s tick;
    // pill / inline only need day-level resolution → hourly tick is enough.
    const intervalMs = variant === 'card' ? 1_000 : 60 * 60 * 1_000;
    const id = setInterval(() => setRemaining(computeRemaining()), intervalMs);
    return () => clearInterval(id);
  }, [variant]);

  const tier = getTier(remaining?.days ?? null);

  if (variant === 'pill') {
    return <PillVariant remaining={remaining} tier={tier} t={t} className={className} />;
  }
  if (variant === 'card') {
    return <CardVariant remaining={remaining} tier={tier} t={t} className={className} />;
  }
  return <InlineVariant remaining={remaining} t={t} className={className} />;
}

// ────────────────────────────────────────────────────────────────────────────
// Pill — for navbars, hero callouts
// ────────────────────────────────────────────────────────────────────────────

function PillVariant({
  remaining,
  tier,
  t,
  className,
}: {
  remaining: TimeRemaining | null;
  tier: Tier;
  t: ReturnType<typeof useTranslations>;
  className: string;
}) {
  const tone =
    tier === 'urgent'
      ? 'border-red-500/40 bg-red-500/10 text-red-300'
      : tier === 'warn'
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';

  const dot =
    tier === 'urgent'
      ? 'bg-red-400'
      : tier === 'warn'
        ? 'bg-amber-400'
        : 'bg-emerald-400';

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border ${tone} px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider ${className}`}
    >
      <Clock className="h-3.5 w-3.5" />
      <span className={`h-1.5 w-1.5 rounded-full ${dot} animate-pulse`} />
      {remaining === null
        ? t('pillFallback')
        : t('pillWithDays', { days: remaining.days.toLocaleString('en-US') })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Card — for landing pages, with days / hours / minutes
// ────────────────────────────────────────────────────────────────────────────

function CardVariant({
  remaining,
  tier,
  t,
  className,
}: {
  remaining: TimeRemaining | null;
  tier: Tier;
  t: ReturnType<typeof useTranslations>;
  className: string;
}) {
  const border =
    tier === 'urgent'
      ? 'border-red-500/40 shadow-[0_0_60px_rgba(239,68,68,0.15)]'
      : tier === 'warn'
        ? 'border-amber-500/40'
        : 'border-emerald-500/30';

  const numberColor =
    tier === 'urgent'
      ? 'text-red-400'
      : tier === 'warn'
        ? 'text-amber-400'
        : 'text-emerald-400';

  // SSR-safe placeholder values. The CSR replacement happens on mount.
  const days = remaining?.days ?? null;
  const hours = remaining?.hours ?? null;
  const minutes = remaining?.minutes ?? null;
  const seconds = remaining?.seconds ?? null;

  return (
    <div
      className={`rounded-2xl border bg-white/5 ${border} p-6 sm:p-8 backdrop-blur-sm ${className}`}
    >
      <div className="text-xs font-semibold uppercase tracking-widest text-white/40 text-center">
        {t('cardSectionLabel')}
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3 text-center">
        <CardCell value={days} label={t('cardDays')} numberColor={numberColor} />
        <CardCell value={hours} label={t('cardHours')} numberColor={numberColor} />
        <CardCell value={minutes} label={t('cardMinutes')} numberColor={numberColor} />
        <CardCell value={seconds} label={t('cardSeconds')} numberColor={numberColor} />
      </div>

      <div className="mt-5 text-center text-sm text-white/50">
        {t('cardDeadlineLabel')}
      </div>

      {tier === 'urgent' && days !== null && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-red-400">
          <AlertTriangle className="h-4 w-4" />
          {t('cardUrgentWarning')}
        </div>
      )}
    </div>
  );
}

function CardCell({
  value,
  label,
  numberColor,
}: {
  value: number | null;
  label: string;
  numberColor: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-2 py-3">
      <div
        className={`font-mono text-3xl sm:text-4xl font-extrabold leading-none tabular-nums ${numberColor}`}
      >
        {value === null ? '—' : value.toString().padStart(2, '0')}
      </div>
      <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
        {label}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Inline — for paragraphs / sentences
// ────────────────────────────────────────────────────────────────────────────

function InlineVariant({
  remaining,
  t,
  className,
}: {
  remaining: TimeRemaining | null;
  t: ReturnType<typeof useTranslations>;
  className: string;
}) {
  return (
    <span className={`font-semibold tabular-nums ${className}`}>
      {remaining === null
        ? t('inlineFallback')
        : t('inlineDays', { days: remaining.days.toLocaleString('en-US') })}
    </span>
  );
}
