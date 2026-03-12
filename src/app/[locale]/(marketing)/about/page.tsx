import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="min-h-screen bg-[#0F172A]">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        <div className="absolute top-0 start-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 end-0 w-[400px] h-[400px] bg-teal-500/6 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_700px_350px_at_50%_58%,rgba(16,185,129,0.13),transparent)] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 font-mono">
            <Sparkles className="h-4 w-4" />
            Our Story
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight leading-[1.05] sm:text-6xl lg:text-7xl">
            <span className="text-white">About </span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Complyance
            </span>
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-white/60">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* ── Mission ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 font-mono">
            Why we exist
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            {t('mission.title')}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Problem card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 flex flex-col gap-4">
            <div className="text-4xl">🌍</div>
            <p className="text-white/75 leading-relaxed text-[15px]">
              The EU AI Act is the world&apos;s first{' '}
              <span className="text-white font-semibold">comprehensive AI regulation</span>,
              and it affects thousands of SaaS companies selling into Europe. But compliance
              tools built for{' '}
              <span className="text-white font-semibold">Fortune 500 companies</span>{' '}
              are out of reach for most SMBs.
            </p>
          </div>

          {/* Mission callout */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.07] p-8 flex flex-col justify-between gap-6">
            <div className="text-4xl">🎯</div>
            <blockquote className="text-xl font-bold text-white leading-snug">
              &ldquo;Democratize AI compliance — no legal team required, no enterprise budget needed.&rdquo;
            </blockquote>
            <p className="text-sm text-white/55 leading-relaxed">
              Just clear guidance and practical tools to help you ship compliant AI products.
            </p>
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 font-mono">
              The challenge
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              {t('problem.title')}
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              { emoji: '🏢', stat: '$50k+', label: 'Enterprise platform cost', text: t('problem.p1') },
              { emoji: '⚠️', stat: '1000s', label: 'SMBs unknowingly at risk', text: t('problem.p2') },
              { emoji: '📅', stat: 'Aug 2026', label: 'EU AI Act deadline', text: t('problem.p3') },
            ].map(({ emoji, stat, label, text }) => (
              <div key={stat} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-4">
                <div className="text-3xl">{emoji}</div>
                <div>
                  <div className="text-2xl font-extrabold text-emerald-400">{stat}</div>
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mt-0.5">{label}</div>
                </div>
                <p className="text-sm text-white/55 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solution ── */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 font-mono">
              How we solve it
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              {t('solution.title')}
            </h2>
            <p className="mt-3 text-white/50 max-w-xl mx-auto">{t('solution.subtitle')}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                emoji: '🤖',
                gradient: 'from-emerald-500/20 to-teal-500/10',
                border: 'border-emerald-500/20',
                title: t('solution.automated.title'),
                desc: t('solution.automated.desc'),
              },
              {
                emoji: '🗺️',
                gradient: 'from-blue-500/20 to-indigo-500/10',
                border: 'border-blue-500/20',
                title: t('solution.actionable.title'),
                desc: t('solution.actionable.desc'),
              },
              {
                emoji: '💚',
                gradient: 'from-violet-500/20 to-purple-500/10',
                border: 'border-violet-500/20',
                title: t('solution.affordable.title'),
                desc: t('solution.affordable.desc'),
              },
            ].map(({ emoji, gradient, border, title, desc }) => (
              <div
                key={title}
                className={`rounded-2xl border ${border} bg-gradient-to-br ${gradient} p-7 flex flex-col gap-4`}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl
                    shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]
                    bg-white/10 backdrop-blur-sm"
                >
                  {emoji}
                </div>
                <h3 className="text-base font-bold text-white">{title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What We Do ── */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 font-mono">
              Features
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              {t('what.title')}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { emoji: '🔍', title: t('what.classify.title'), desc: t('what.classify.desc') },
              { emoji: '📊', title: t('what.gaps.title'),     desc: t('what.gaps.desc') },
              { emoji: '📄', title: t('what.documents.title'), desc: t('what.documents.desc') },
              { emoji: '🔗', title: t('what.vendors.title'),  desc: t('what.vendors.desc') },
              { emoji: '🔔', title: t('what.updates.title'),  desc: t('what.updates.desc') },
            ].map(({ emoji, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-xl border border-white/8 bg-white/[0.03] p-5 hover:bg-white/[0.06] hover:border-white/15 transition-colors"
              >
                <div
                  className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl
                    bg-white/8 shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]"
                >
                  {emoji}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-6 py-5 flex gap-3">
          <span className="text-2xl shrink-0">⚠️</span>
          <div>
            <h3 className="font-semibold text-amber-300 mb-1">{t('disclaimer.title')}</h3>
            <p className="text-sm text-amber-200/60 leading-relaxed">{t('disclaimer.desc')}</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative border-t border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_600px_300px_at_50%_50%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-white/55 mb-8 max-w-xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_4px_24px_rgba(16,185,129,0.4)] hover:shadow-[0_4px_32px_rgba(16,185,129,0.55)]"
            >
              <Link href="/auth/register">
                {t('cta.start')}
                <ArrowRight className="ms-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/pricing">{t('cta.pricing')}</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
