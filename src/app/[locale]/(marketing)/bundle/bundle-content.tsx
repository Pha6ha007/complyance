'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  ShieldCheck,
  Activity,
  Layers,
  Check,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { EUAIActCountdown } from '@/components/eu-ai-act-countdown';

const TRACEHAWK_PUBLIC_URL =
  process.env.NEXT_PUBLIC_TRACEHAWK_URL ?? 'https://tracehawk.dev';

export function BundleContent() {
  const tHero = useTranslations('bundle.hero');
  const tLifecycle = useTranslations('bundle.lifecycle');
  const tPricing = useTranslations('bundle.pricing');
  const tCta = useTranslations('bundle.cta');
  const tCols = useTranslations('bundle.columns');

  // Five features per column. Keys are 1-based for human readability.
  const featureKeys = [1, 2, 3, 4, 5] as const;

  return (
    <div className="relative min-h-screen bg-[#0F172A] overflow-hidden">
      {/* Animated grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      {/* Glow orbs */}
      <div className="pointer-events-none absolute top-0 start-1/4 h-[600px] w-[600px] rounded-full bg-emerald-500/8 blur-[100px]" />
      <div className="pointer-events-none absolute top-[40%] end-0 h-[500px] w-[500px] rounded-full bg-teal-500/6 blur-[100px]" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            {tHero('eyebrow')}
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl font-dm-sans">
            {tHero('title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/60 leading-relaxed">
            {tHero('subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:bg-emerald-400 hover:shadow-[0_4px_24px_rgba(16,185,129,0.5)] transition-all"
            >
              {tHero('primaryCta')}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#lifecycle"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 transition-all"
            >
              {tHero('secondaryCta')}
            </a>
          </div>
          <div className="mt-8 flex justify-center">
            <EUAIActCountdown variant="pill" />
          </div>
        </div>
      </section>

      {/* ── Lifecycle (3-step) ───────────────────────────────────────────── */}
      <section
        id="lifecycle"
        className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 scroll-mt-24"
      >
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            {tLifecycle('eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl font-dm-sans">
            {tLifecycle('heading')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-white/50">
            {tLifecycle('subhead')}
          </p>
        </div>

        <div className="relative mt-14">
          {/* Connector line */}
          <div className="pointer-events-none absolute start-0 end-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent md:block" />
          <ol className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((n) => {
              const Icon = n === 1 ? ShieldCheck : n === 2 ? Activity : Layers;
              return (
                <li key={n} className="relative">
                  <div className="flex flex-col items-center text-center md:items-start md:text-start">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/40 bg-[#0F172A] text-emerald-400 ring-4 ring-[#0F172A]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-white">
                      {tLifecycle(`step${n}Title` as const)}
                    </h3>
                    <p className="mt-2 text-sm text-white/55 leading-relaxed">
                      {tLifecycle(`step${n}Desc` as const)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── Three columns: Complyance / TraceHawk / Together ─────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {/* Complyance column */}
          <ProductColumn
            name={tCols('complyance.name')}
            tagline={tCols('complyance.tagline')}
            accent="emerald"
            icon={<ShieldCheck className="h-5 w-5" />}
            features={featureKeys.map((n) =>
              tCols(`complyance.feature${n}` as const)
            )}
          />

          {/* TraceHawk column */}
          <ProductColumn
            name={tCols('tracehawk.name')}
            tagline={tCols('tracehawk.tagline')}
            accent="sky"
            icon={<Activity className="h-5 w-5" />}
            features={featureKeys.map((n) =>
              tCols(`tracehawk.feature${n}` as const)
            )}
          />

          {/* Together column — emphasized */}
          <ProductColumn
            name={tCols('together.name')}
            tagline={tCols('together.tagline')}
            accent="amber"
            highlighted
            icon={<Layers className="h-5 w-5" />}
            features={featureKeys.map((n) =>
              tCols(`together.feature${n}` as const)
            )}
          />
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 scroll-mt-24"
      >
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            {tPricing('eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl font-dm-sans">
            {tPricing('heading')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-white/50">
            {tPricing('subhead')}
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {/* Complyance */}
          <PricingCard
            name="Complyance"
            price={tPricing('complyancePrice')}
            period={tPricing('complyancePeriod')}
            cta={tPricing('complyanceCta')}
            href="/register"
            isInternal
          />

          {/* Bundle — highlighted */}
          <PricingCard
            name="Bundle"
            price={tPricing('bundlePrice')}
            period={tPricing('bundlePeriod')}
            badge={tPricing('bundleBadge')}
            savings={tPricing('bundleSavings')}
            note={tPricing('bundleNote')}
            cta={tPricing('bundleCta')}
            href="/register?plan=bundle"
            isInternal
            highlighted
          />

          {/* TraceHawk */}
          <PricingCard
            name="TraceHawk"
            price={tPricing('tracehawkPrice')}
            period={tPricing('tracehawkPeriod')}
            cta={tPricing('tracehawkCta')}
            href={`${TRACEHAWK_PUBLIC_URL}/signup`}
            external
          />
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl font-dm-sans">
            {tCta('heading')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/60">
            {tCta('subhead')}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register?plan=bundle"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:bg-emerald-400 hover:shadow-[0_4px_24px_rgba(16,185,129,0.5)] transition-all"
            >
              {tCta('button')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 transition-all"
            >
              {tCta('secondary')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

interface ProductColumnProps {
  name: string;
  tagline: string;
  features: string[];
  icon: React.ReactNode;
  accent: 'emerald' | 'sky' | 'amber';
  highlighted?: boolean;
}

function ProductColumn({
  name,
  tagline,
  features,
  icon,
  accent,
  highlighted = false,
}: ProductColumnProps) {
  const accentBg =
    accent === 'emerald'
      ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
      : accent === 'sky'
        ? 'bg-sky-500/10 text-sky-400 ring-sky-500/20'
        : 'bg-amber-500/10 text-amber-400 ring-amber-500/20';

  const cardBorder = highlighted
    ? 'border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.08)]'
    : 'border-white/10';

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-white/5 p-6 backdrop-blur-sm ${cardBorder}`}
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${accentBg}`}>
        {icon}
      </div>
      <h3 className="mt-4 text-xl font-bold text-white">{name}</h3>
      <p className="mt-1 text-sm text-white/40">{tagline}</p>
      <ul className="mt-5 space-y-2.5">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/70 leading-snug">
            <Check
              className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                accent === 'emerald'
                  ? 'text-emerald-400'
                  : accent === 'sky'
                    ? 'text-sky-400'
                    : 'text-amber-400'
              }`}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  cta: string;
  href: string;
  isInternal?: boolean;
  external?: boolean;
  badge?: string;
  savings?: string;
  note?: string;
  highlighted?: boolean;
}

function PricingCard({
  name,
  price,
  period,
  cta,
  href,
  isInternal = false,
  external = false,
  badge,
  savings,
  note,
  highlighted = false,
}: PricingCardProps) {
  const cardClasses = highlighted
    ? 'relative rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-500/15 via-emerald-500/8 to-transparent p-8 shadow-[0_0_60px_rgba(16,185,129,0.15)] lg:scale-105'
    : 'relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm';

  const buttonClasses = highlighted
    ? 'inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:bg-emerald-400 transition-all'
    : 'inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition-all';

  const ctaContent = (
    <>
      {cta}
      {external ? <ExternalLink className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
    </>
  );

  return (
    <div className={cardClasses}>
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full border border-emerald-400/40 bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-[0_4px_16px_rgba(16,185,129,0.4)]">
            {badge}
          </span>
        </div>
      )}

      <h3 className="text-lg font-bold text-white">{name}</h3>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-5xl font-extrabold text-white tracking-tight">{price}</span>
        <span className="text-sm text-white/40">{period}</span>
      </div>

      {savings && (
        <div className="mt-2 text-xs font-semibold text-emerald-400">{savings}</div>
      )}

      <div className="mt-6">
        {isInternal ? (
          <Link href={href} className={buttonClasses}>
            {ctaContent}
          </Link>
        ) : (
          <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClasses}>
            {ctaContent}
          </a>
        )}
      </div>

      {note && (
        <p className="mt-4 text-center text-xs text-white/40">{note}</p>
      )}
    </div>
  );
}
