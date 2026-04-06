'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ShieldCheck,
  ClipboardList,
  FileText,
  Activity,
  LineChart,
  Bell,
  CalendarDays,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Send,
  ExternalLink,
} from 'lucide-react';

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ||
  'https://calendly.com/complyance/ai-compliance-assessment';

// EU AI Act high-risk obligations enter into application on 2 August 2026.
// Reference: Regulation (EU) 2024/1689, Article 113.
const DEADLINE_ISO = '2026-08-02T00:00:00Z';

// ────────────────────────────────────────────────────────────────────────────
// Inline countdown — full standalone component for Task 3.3 will be in
// src/components/eu-ai-act-countdown.tsx. This inline version is intentionally
// scoped to the managed page so we don't pre-empt that task.
// ────────────────────────────────────────────────────────────────────────────

type CountdownVariant = 'hero' | 'urgent';

function DeadlineCountdown({ variant }: { variant: CountdownVariant }) {
  const t = useTranslations('managed.countdown');
  // Render with `null` first to avoid SSR/CSR hydration mismatch on the
  // computed days. We update on mount.
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const compute = () => {
      const ms = new Date(DEADLINE_ISO).getTime() - Date.now();
      setDays(Math.max(0, Math.ceil(ms / 86_400_000)));
    };
    compute();
    const id = setInterval(compute, 60 * 60 * 1000); // refresh hourly
    return () => clearInterval(id);
  }, []);

  const isCritical = days !== null && days < 90;
  const isUrgent = days !== null && days < 180;

  if (variant === 'hero') {
    const tone = isCritical
      ? 'border-red-500/40 bg-red-500/10 text-red-300'
      : isUrgent
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';

    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border ${tone} px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isCritical ? 'bg-red-400' : isUrgent ? 'bg-amber-400' : 'bg-emerald-400'
          } animate-pulse`}
        />
        {days === null
          ? t('deadlineLabel')
          : t('deadlineInDays', { days: days.toLocaleString('en-US') })}
      </div>
    );
  }

  // urgent variant — large counter card
  return (
    <div
      className={`rounded-2xl border ${
        isCritical
          ? 'border-red-500/40 bg-red-500/5 shadow-[0_0_60px_rgba(239,68,68,0.15)]'
          : 'border-amber-500/30 bg-amber-500/5'
      } p-8 text-center`}
    >
      <div className="text-xs font-semibold uppercase tracking-widest text-white/40">
        {t('urgentSectionLabel')}
      </div>
      <div
        className={`mt-3 font-mono text-6xl font-extrabold leading-none ${
          isCritical ? 'text-red-400' : 'text-amber-400'
        }`}
      >
        {days === null ? '—' : days.toLocaleString('en-US')}
      </div>
      <div className="mt-2 text-sm text-white/50">{t('urgentDaysLabel')}</div>
      {isCritical && days !== null && (
        <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-red-400">
          <AlertTriangle className="h-4 w-4" />
          {t('urgentWarning')}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Managed-service lead form — submits to /api/contact with type='managed_service'
// ────────────────────────────────────────────────────────────────────────────

interface LeadFormState {
  name: string;
  email: string;
  company: string;
  aiSystemCount: '' | '1-5' | '5-20' | '20+';
  message: string;
}

const INITIAL_FORM: LeadFormState = {
  name: '',
  email: '',
  company: '',
  aiSystemCount: '',
  message: '',
};

function LeadForm() {
  const t = useTranslations('managed.form');
  const [form, setForm] = useState<LeadFormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (form.message.trim().length < 10) {
      setError(t('errorMinLength'));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          // Lead-source marker for routing in the inbox.
          type: 'managed_service',
          // Existing schema requires `subject`; default keeps it neutral.
          subject: 'general',
          ...(form.company.trim() ? { company: form.company.trim() } : {}),
          ...(form.aiSystemCount ? { aiSystemCount: form.aiSystemCount } : {}),
          message: form.message.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detail = Array.isArray(data?.details)
          ? data.details.join(', ')
          : data?.error || t('errorGeneric');
        throw new Error(detail);
      }

      setSuccess(true);
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/40">
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">{t('successHeading')}</h3>
        <p className="mt-2 text-sm text-white/60 max-w-md mx-auto">
          {t('successBody')}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="lead-name"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50"
          >
            {t('name')} <span className="text-red-400">*</span>
          </label>
          <input
            id="lead-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>
        <div>
          <label
            htmlFor="lead-email"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50"
          >
            {t('email')} <span className="text-red-400">*</span>
          </label>
          <input
            id="lead-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="lead-company"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50"
          >
            {t('company')}
          </label>
          <input
            id="lead-company"
            type="text"
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>
        <div>
          <label
            htmlFor="lead-systems"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50"
          >
            {t('systemsLabel')}
          </label>
          <select
            id="lead-systems"
            value={form.aiSystemCount}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                aiSystemCount: e.target.value as LeadFormState['aiSystemCount'],
              }))
            }
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
            style={{ colorScheme: 'dark' }}
          >
            <option value="" className="bg-[#1e293b]">
              {t('systemsPlaceholder')}
            </option>
            <option value="1-5" className="bg-[#1e293b]">
              {t('systemsOption1to5')}
            </option>
            <option value="5-20" className="bg-[#1e293b]">
              {t('systemsOption5to20')}
            </option>
            <option value="20+" className="bg-[#1e293b]">
              {t('systemsOption20plus')}
            </option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="lead-message"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50"
        >
          {t('message')} <span className="text-red-400">*</span>
        </label>
        <textarea
          id="lead-message"
          required
          minLength={10}
          rows={4}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder={t('messagePlaceholder')}
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_4px_24px_rgba(16,185,129,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('submitting')}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {t('submit')}
          </>
        )}
      </button>

      <p className="text-center text-xs text-white/30">{t('privacyNote')}</p>
    </form>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Calendly embed with graceful fallback
// ────────────────────────────────────────────────────────────────────────────

function CalendlyEmbed() {
  const t = useTranslations('managed.calendar');
  const [iframeFailed, setIframeFailed] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
      {!iframeFailed ? (
        <>
          <iframe
            src={CALENDLY_URL}
            width="100%"
            height="650"
            frameBorder={0}
            title={t('iframeTitle')}
            className="block w-full"
            onError={() => setIframeFailed(true)}
          />
          {/* Fallback link is always rendered below for users on networks
              that block third-party iframes (corporate firewalls). */}
          <div className="border-t border-white/10 bg-black/20 px-4 py-3 text-center">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-emerald-400 transition-colors"
            >
              {t('fallbackInline')}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </>
      ) : (
        <div className="p-10 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-emerald-400" />
          <h3 className="mt-4 text-lg font-bold text-white">{t('fallbackHeading')}</h3>
          <p className="mt-2 text-sm text-white/50 max-w-sm mx-auto">{t('fallbackBody')}</p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:bg-emerald-400 transition-all"
          >
            {t('fallbackCta')}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Page content
// ────────────────────────────────────────────────────────────────────────────

const INCLUDED_ICONS = [ClipboardList, LineChart, FileText, Activity, ShieldCheck, Bell] as const;

export function ManagedContent() {
  const tHero = useTranslations('managed.hero');
  const tIncluded = useTranslations('managed.included');
  const tHow = useTranslations('managed.howItWorks');
  const tWhy = useTranslations('managed.whyNow');
  const tFaq = useTranslations('managed.faq');
  const tCta = useTranslations('managed.cta');

  // Index 1..6 — keys are 1-based to keep them human-readable.
  const includedItems = [1, 2, 3, 4, 5, 6] as const;
  const howSteps = [1, 2, 3] as const;
  const whyPoints = [1, 2, 3] as const;
  const faqItems = [1, 2, 3, 4] as const;

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
      <div className="pointer-events-none absolute top-[40%] end-0 h-[500px] w-[500px] rounded-full bg-amber-500/6 blur-[100px]" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <DeadlineCountdown variant="hero" />
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl font-dm-sans">
            {tHero('titleStart')}{' '}
            <span className="text-emerald-400">{tHero('titleAccent')}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/60 leading-relaxed">
            {tHero('subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#book"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:bg-emerald-400 hover:shadow-[0_4px_24px_rgba(16,185,129,0.5)] transition-all"
            >
              {tHero('bookCta')}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 transition-all"
            >
              {tHero('howCta')}
            </a>
          </div>
          <p className="mt-6 text-xs text-white/30">{tHero('tagline')}</p>
        </div>
      </section>

      {/* ── What's included ─────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            {tIncluded('eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl font-dm-sans">
            {tIncluded('heading')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-white/50">
            {tIncluded('subhead')}
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {includedItems.map((n) => {
            const Icon = INCLUDED_ICONS[n - 1];
            return (
              <div
                key={n}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">
                  {tIncluded(`item${n}Title` as const)}
                </h3>
                <p className="mt-2 text-sm text-white/55 leading-relaxed">
                  {tIncluded(`item${n}Desc` as const)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section
        id="how"
        className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 scroll-mt-24"
      >
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            {tHow('eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl font-dm-sans">
            {tHow('heading')}
          </h2>
        </div>

        <div className="relative mt-14">
          {/* Connector line */}
          <div className="pointer-events-none absolute start-0 end-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent md:block" />
          <ol className="grid gap-8 md:grid-cols-3">
            {howSteps.map((n) => (
              <li key={n} className="relative">
                <div className="flex flex-col items-center text-center md:items-start md:text-start">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/40 bg-[#0F172A] font-bold text-emerald-400 ring-4 ring-[#0F172A]">
                    {n}
                  </div>
                  <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-emerald-400/70">
                    {tHow(`step${n}Label` as const)}
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-white">
                    {tHow(`step${n}Title` as const)}
                  </h3>
                  <p className="mt-2 text-sm text-white/55 leading-relaxed">
                    {tHow(`step${n}Desc` as const)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Why now (urgency) ────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-red-400">
              {tWhy('eyebrow')}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl font-dm-sans">
              {tWhy('heading')}
            </h2>
            <ul className="mt-6 space-y-4">
              {whyPoints.map((n) => {
                const Icon = n === 1 ? AlertTriangle : n === 2 ? Clock : ShieldCheck;
                const iconColor = n === 1 ? 'text-red-400' : n === 2 ? 'text-amber-400' : 'text-emerald-400';
                return (
                  <li key={n} className="flex gap-3">
                    <Icon className={`h-5 w-5 flex-shrink-0 ${iconColor} mt-0.5`} />
                    <div>
                      <div className="font-semibold text-white">
                        {tWhy(`point${n}Title` as const)}
                      </div>
                      <div className="text-sm text-white/50">
                        {tWhy(`point${n}Desc` as const)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <DeadlineCountdown variant="urgent" />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            {tFaq('eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl font-dm-sans">
            {tFaq('heading')}
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {faqItems.map((n) => (
            <details
              key={n}
              className="group rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all open:border-emerald-500/30 open:bg-white/8"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-white list-none [&::-webkit-details-marker]:hidden">
                {tFaq(`q${n}` as const)}
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/15 text-white/40 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="border-t border-white/10 px-5 py-4 text-sm text-white/60 leading-relaxed">
                {tFaq(`a${n}` as const)}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA: lead form + Calendly ───────────────────────────────────── */}
      <section
        id="book"
        className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 scroll-mt-24"
      >
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            {tCta('eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl font-dm-sans">
            {tCta('heading')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-white/50">{tCta('subhead')}</p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Lead form */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/40">
              <Send className="h-3.5 w-3.5" />
              {tCta('formLabel')}
            </div>
            <LeadForm />
          </div>

          {/* Calendly embed */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/40">
              <CalendarDays className="h-3.5 w-3.5" />
              {tCta('calendarLabel')}
            </div>
            <CalendlyEmbed />
          </div>
        </div>
      </section>
    </div>
  );
}
