import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Shield, BarChart3, FileCheck, Users, Bell, Award, AlertTriangle, Clock, ScanSearch } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/marketing/scroll-reveal';
import { AnimatedGrid } from '@/components/marketing/animated-grid';
import { MarketingHeader } from '@/components/shared/marketing-header';
import Footer from '@/components/shared/footer';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'marketing' });
  return {
    title: 'Complyance — AI Compliance Management for SMBs',
    description: t('hero.subtitle'),
  };
}

const DEADLINE = new Date('2026-08-02');
function getDaysLeft() {
  return Math.max(0, Math.ceil((DEADLINE.getTime() - Date.now()) / 86400000));
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'marketing' });
  const days = getDaysLeft();

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader locale={locale} />

      <main>
        <HeroSection t={t} days={days} />
        <TrustBar t={t} />
        <ProblemSection t={t} />
        <HowItWorksSection t={t} />
        <FeaturesSection t={t} />
        <BadgeSection t={t} />
        <PricingPreview t={t} />
        <TestimonialsSection t={t} />
        <BottomCTA t={t} />
      </main>

      <Footer />
    </div>
  );
}

/* ─── HERO ─────────────────────────────────────────────── */

function HeroSection({ t, days }: { t: any; days: number }) {
  return (
    <section className="relative bg-[#0F172A] min-h-screen flex items-center overflow-hidden pt-16">
      <AnimatedGrid />
      {/* Orbs */}
      <div className="absolute top-0 start-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 end-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* LEFT */}
        <div>
          {/* Deadline badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-8 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            {days} {t('hero.deadlineBadge')}
          </div>

          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
            {t('hero.titleLine1')}<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {t('hero.titleLine2')}
            </span>
          </h1>

          <p className="text-lg text-white/50 leading-relaxed mb-10 max-w-lg">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all duration-200 shadow-[0_0_32px_rgba(16,185,129,0.35)] hover:shadow-[0_0_48px_rgba(16,185,129,0.5)] hover:-translate-y-0.5"
            >
              {t('hero.ctaPrimary')} →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/15 hover:border-white/40 text-white/80 hover:text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              {t('hero.ctaSecondary')}
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3">
            <div className="flex">
              {['A', 'M', 'S', 'K'].map((letter, i) => (
                <div
                  key={letter}
                  className="w-8 h-8 rounded-full border-2 border-[#0F172A] bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold -ms-2 first:ms-0"
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/40">
              <span className="text-white/70 font-semibold">500+</span> {t('hero.socialProof')}
            </p>
          </div>
        </div>

        {/* RIGHT — Dashboard Mockup */}
        <div className="hidden lg:block">
          <DashboardMockup days={days} />
        </div>
      </div>
    </section>
  );
}

/* ─── DASHBOARD MOCKUP ─────────────────────────────────── */

function DashboardMockup({ days }: { days: number }) {
  return (
    <div className="relative group">
      <div className="rounded-2xl border border-white/8 bg-slate-800/60 backdrop-blur-sm shadow-[0_32px_80px_rgba(0,0,0,0.5)] transition-transform duration-700 [transform:perspective(1200px)_rotateY(-6deg)_rotateX(4deg)] group-hover:[transform:perspective(1200px)_rotateY(-2deg)_rotateX(1deg)]">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6 bg-[#0F172A]/60">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 mx-3 h-6 bg-white/4 rounded-md flex items-center justify-center">
            <span className="text-[11px] text-white/25 font-mono">app.complyance.io/dashboard</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'SCORE', value: '74%', color: 'text-emerald-400' },
              { label: 'SYSTEMS', value: '12', color: 'text-blue-400' },
              { label: 'GAPS', value: '3', color: 'text-amber-400' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0F172A]/60 border border-white/6 rounded-xl p-3">
                <p className="text-[10px] text-white/30 font-mono mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Chart + Countdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 bg-[#0F172A]/60 border border-white/6 rounded-xl p-3">
              <p className="text-[10px] text-white/30 font-mono mb-3">COMPLIANCE TREND</p>
              <div className="flex items-end gap-1 h-12">
                {[40, 65, 50, 80, 60, 90, 74].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-emerald-500/20 border-t-2 border-emerald-500/60 rounded-sm"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="bg-[#0F172A]/60 border border-white/6 rounded-xl p-3 flex flex-col items-center justify-center">
              <p className="text-[10px] text-white/30 font-mono mb-1">DEADLINE</p>
              <p className="text-3xl font-black text-white leading-none">{days}</p>
              <p className="text-[10px] text-white/30 font-mono mt-1">DAYS LEFT</p>
              <div className="w-full mt-2 h-1 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
              </div>
            </div>
          </div>

          {/* Systems list */}
          <div className="bg-[#0F172A]/60 border border-white/6 rounded-xl p-3">
            <p className="text-[10px] text-white/30 font-mono mb-2">AI SYSTEMS</p>
            <div className="space-y-2">
              {[
                { name: 'CV Screening Engine', risk: 'HIGH', color: 'bg-red-500/15 text-red-400' },
                { name: 'Customer Chatbot', risk: 'LIMITED', color: 'bg-amber-500/15 text-amber-400' },
                { name: 'Content Recommender', risk: 'MINIMAL', color: 'bg-emerald-500/15 text-emerald-400' },
              ].map((sys) => (
                <div key={sys.name} className="flex items-center justify-between px-2 py-1.5 bg-white/3 rounded-lg">
                  <span className="text-[11px] text-white/60">{sys.name}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${sys.color}`}>{sys.risk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TRUST BAR ────────────────────────────────────────── */

function TrustBar({ t }: { t: any }) {
  const companies = [
    'Acme Corp', 'TechFlow', 'DataSync', 'CloudBase', 'NeuralStack', 'DevPilot',
  ];

  return (
    <section className="py-12 border-y border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-sm text-slate-400 uppercase tracking-widest mb-8 font-medium">
          {t('trust.label')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {companies.map((company) => (
            <span
              key={company}
              className="text-slate-300 font-semibold text-lg tracking-tight select-none"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PROBLEM SECTION ──────────────────────────────────── */

function ProblemSection({ t }: { t: any }) {
  const stats = [
    { value: t('problem.stat1Value'), name: t('problem.stat1Label'), sub: t('problem.stat1Sub'), icon: <AlertTriangle className="w-7 h-7 text-red-500" />, iconBg: 'bg-red-500/10', accent: 'before:bg-red-500' },
    { value: t('problem.stat2Value'), name: t('problem.stat2Label'), sub: t('problem.stat2Sub'), icon: <Users className="w-7 h-7 text-amber-500" />, iconBg: 'bg-amber-500/10', accent: 'before:bg-amber-500' },
    { value: t('problem.stat3Value'), name: t('problem.stat3Label'), sub: t('problem.stat3Sub'), icon: <Clock className="w-7 h-7 text-blue-500" />, iconBg: 'bg-blue-500/10', accent: 'before:bg-blue-500' },
  ];
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-emerald-700 font-mono mb-3">{t('problem.label')}</p>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">{t('problem.title')}</h2>
          <p className="text-lg text-gray-500">{t('problem.subtitle')}</p>
        </div>
        <ScrollReveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((s) => (
            <div
              key={s.value}
              className={`relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden before:absolute before:top-0 before:start-0 before:end-0 before:h-1 ${s.accent}`}
            >
              <div className={`w-14 h-14 rounded-2xl ${s.iconBg} flex items-center justify-center mb-6`}>
                {s.icon}
              </div>
              <p className="text-5xl font-black text-gray-900 tracking-tight mb-2">{s.value}</p>
              <p className="font-bold text-gray-800 mb-1">{s.name}</p>
              <p className="text-sm text-gray-400">{s.sub}</p>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ─────────────────────────────────────── */

function HowItWorksSection({ t }: { t: any }) {
  const steps = [
    { num: '1', icon: <ScanSearch className="w-8 h-8 text-emerald-400" />, title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc') },
    { num: '2', icon: <BarChart3 className="w-8 h-8 text-emerald-400" />, title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc') },
    { num: '3', icon: <FileCheck className="w-8 h-8 text-emerald-400" />, title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc') },
  ];
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-emerald-700 font-mono mb-3">{t('howItWorks.label')}</p>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">{t('howItWorks.title')}</h2>
          <p className="text-lg text-gray-500">{t('howItWorks.subtitle')}</p>
        </div>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Connecting line desktop only */}
          <div className="hidden md:block absolute top-8 start-[calc(16.66%+32px)] end-[calc(16.66%+32px)] h-px bg-gradient-to-r from-emerald-300 to-emerald-400 opacity-40" />
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-2xl font-black flex items-center justify-center mb-6 shadow-[0_8px_24px_rgba(16,185,129,0.3)] ring-8 ring-emerald-500/[0.08] relative z-10">
                {step.num}
              </div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto mt-4 mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURES ─────────────────────────────────────────── */

function FeaturesSection({ t }: { t: any }) {
  const features = [
    { icon: <Shield className="w-6 h-6" />, title: t('features.f1Title'), desc: t('features.f1Desc'), featured: false },
    { icon: <BarChart3 className="w-6 h-6" />, title: t('features.f2Title'), desc: t('features.f2Desc'), featured: false },
    { icon: <FileCheck className="w-6 h-6" />, title: t('features.f3Title'), desc: t('features.f3Desc'), featured: false },
    { icon: <Users className="w-6 h-6" />, title: t('features.f4Title'), desc: t('features.f4Desc'), featured: false },
    { icon: <Bell className="w-6 h-6" />, title: t('features.f5Title'), desc: t('features.f5Desc'), featured: true },
    { icon: <Award className="w-6 h-6" />, title: t('features.f6Title'), desc: t('features.f6Desc'), featured: false },
  ];
  return (
    <section className="py-24 bg-[#0F172A]" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-emerald-400 font-mono mb-3">{t('features.label')}</p>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">{t('features.title')}</h2>
          <p className="text-lg text-white/50">{t('features.subtitle')}</p>
        </div>
        <ScrollReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat) => (
            <div
              key={feat.title}
              className={`group relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 cursor-default overflow-hidden
                ${feat.featured
                  ? 'bg-emerald-500/[0.06] border-emerald-500/25'
                  : 'bg-white/[0.03] border-white/[0.06] hover:border-emerald-500/25 hover:bg-white/[0.05] hover:shadow-[0_24px_48px_rgba(0,0,0,0.3)]'
                }`}
            >
              {feat.featured && (
                <span className="absolute top-4 end-4 bg-emerald-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full font-mono uppercase tracking-wider">
                  Popular
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border
                ${feat.featured
                  ? 'bg-emerald-500 border-emerald-400 text-white'
                  : 'bg-emerald-500/[0.12] border-emerald-500/20 text-emerald-400'
                }`}>
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── BADGE SECTION ────────────────────────────────────── */

function BadgeSection({ t }: { t: any }) {
  const badges = [
    { level: t('badge.level1'), tier: 'Free', gradient: 'from-slate-400 to-slate-500', checks: [t('badge.level1Check1'), t('badge.level1Check2')] },
    { level: t('badge.level2'), tier: 'Starter', gradient: 'from-emerald-400 to-teal-500', checks: [t('badge.level2Check1'), t('badge.level2Check2'), t('badge.level2Check3')] },
    { level: t('badge.level3'), tier: 'Professional', gradient: 'from-emerald-600 to-emerald-500', checks: [t('badge.level3Check1'), t('badge.level3Check2'), t('badge.level3Check3'), t('badge.level3Check4')], featured: true },
  ];
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-emerald-700 font-mono mb-3">{t('badge.label')}</p>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">{t('badge.title')}</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">{t('badge.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {badges.map((badge) => (
            <div
              key={badge.level}
              className={`bg-white rounded-2xl p-8 text-center border-2 transition-all duration-300 hover:-translate-y-1
                ${badge.featured
                  ? 'border-emerald-400 shadow-xl shadow-emerald-100 -translate-y-2 scale-[1.02]'
                  : 'border-gray-200 hover:border-emerald-200 hover:shadow-lg'
                }`}
            >
              <div className={`w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br ${badge.gradient} flex items-center justify-center shadow-lg text-3xl text-white font-bold`}>
                ✓
              </div>
              <p className="text-xs font-bold tracking-widest uppercase text-emerald-700 font-mono mb-1">{badge.tier}</p>
              <h3 className="text-lg font-extrabold text-gray-900 mb-5">{badge.level}</h3>
              <ul className="space-y-2 text-sm text-gray-600 text-start">
                {badge.checks.map((c) => (
                  <li key={c} className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold flex-shrink-0">✓</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 mt-10">{t('badge.note')}</p>
      </div>
    </section>
  );
}

/* ─── PRICING PREVIEW ──────────────────────────────────── */

function PricingPreview({ t }: { t: any }) {
  const plans = [
    {
      name: 'Free', price: t('pricing.freePriceMonthly'), period: t('pricing.perForever'),
      desc: t('pricing.freeDesc'),
      features: [t('pricing.freeFeature1'), t('pricing.freeFeature2'), t('pricing.freeFeature3')],
      cta: t('pricing.ctaFree'), href: '/register', solid: false,
    },
    {
      name: 'Starter', price: t('pricing.starterPriceMonthly'), period: t('pricing.perMonth'),
      desc: t('pricing.starterDesc'),
      features: [t('pricing.starterFeature1'), t('pricing.starterFeature2'), t('pricing.starterFeature3'), t('pricing.starterFeature4')],
      cta: t('pricing.ctaStarter'), href: '/register?plan=starter', solid: true, popular: true,
    },
    {
      name: 'Professional', price: t('pricing.proPriceMonthly'), period: t('pricing.perMonth'),
      desc: t('pricing.proDesc'),
      features: [t('pricing.proFeature1'), t('pricing.proFeature2'), t('pricing.proFeature3'), t('pricing.proFeature4'), t('pricing.proFeature5')],
      cta: t('pricing.ctaPro'), href: '/register?plan=professional', solid: false,
    },
  ];
  return (
    <section className="py-24 bg-white" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-emerald-700 font-mono mb-3">{t('pricing.label')}</p>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">{t('pricing.title')}</h2>
          <p className="text-lg text-gray-500">{t('pricing.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1
                ${plan.popular
                  ? 'bg-white border-emerald-400 shadow-xl shadow-emerald-100 ring-1 ring-emerald-400/20'
                  : 'bg-gray-50 border-gray-200 hover:border-emerald-200 hover:shadow-lg'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 start-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-4 py-1 rounded-full font-mono uppercase tracking-wider">
                  {t('pricing.popular')}
                </div>
              )}
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 font-mono mb-2">{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-black text-gray-900 tracking-tight">{plan.price}</span>
                <span className="text-sm text-gray-400">{plan.period}</span>
              </div>
              <p className="text-sm text-gray-400 mb-6 pb-6 border-b border-gray-100">{plan.desc}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-emerald-500 font-bold flex-shrink-0 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`flex items-center justify-center w-full py-3 rounded-xl font-bold text-sm transition-all duration-200
                  ${plan.solid
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                    : 'border border-gray-300 hover:border-emerald-400 text-gray-700 hover:text-emerald-700'
                  }`}
              >
                {plan.cta} →
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center mt-8">
          <Link href="/pricing" className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 inline-flex items-center gap-1">
            {t('pricing.viewAll')} →
          </Link>
        </p>
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS ─────────────────────────────────────── */

function TestimonialsSection({ t }: { t: any }) {
  const items = [
    { quote: t('testimonials.t1Quote'), name: t('testimonials.t1Author'), role: t('testimonials.t1Role'), flag: '\uD83C\uDDE9\uD83C\uDDEA', initial: 'S' },
    { quote: t('testimonials.t2Quote'), name: t('testimonials.t2Author'), role: t('testimonials.t2Role'), flag: '\uD83C\uDDF3\uD83C\uDDF1', initial: 'M' },
    { quote: t('testimonials.t3Quote'), name: t('testimonials.t3Author'), role: t('testimonials.t3Role'), flag: '\uD83C\uDDEE\uD83C\uDDF9', initial: 'E' },
  ];
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-emerald-700 font-mono mb-3">{t('testimonials.label')}</p>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">{t('testimonials.title')}</h2>
          <p className="text-lg text-gray-500">{t('testimonials.subtitle')}</p>
        </div>
        <ScrollReveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.name} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:-translate-y-1 hover:border-emerald-100 hover:shadow-lg transition-all duration-300">
              <div className="text-6xl leading-none text-emerald-500/20 font-black mb-3">&ldquo;</div>
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic mb-6">&ldquo;{item.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {item.initial}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{item.name} {item.flag}</p>
                  <p className="text-xs text-gray-400">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── BOTTOM CTA ───────────────────────────────────────── */

function BottomCTA({ t }: { t: any }) {
  return (
    <section className="py-28 bg-[#0F172A] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_600px_400px_at_50%_50%,rgba(16,185,129,0.15),transparent)] pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6">
          {t('finalCta.title').split('Compliance').map((part: string, i: number) =>
            i === 0 ? (
              <span key={i}>{part}<span className="text-emerald-400">Compliance</span></span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </h2>
        <p className="text-lg text-white/45 mb-12">{t('finalCta.subtitle')}</p>
        <div className="flex flex-wrap gap-4 justify-center mb-10">
          <Link href="/register" className="inline-flex items-center gap-2 px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
            {t('finalCta.button')} →
          </Link>
          <Link href="/pricing" className="inline-flex items-center gap-2 px-8 py-5 border border-white/15 hover:border-white/40 text-white/80 hover:text-white font-semibold rounded-2xl transition-all duration-200">
            {t('finalCta.secondary')}
          </Link>
        </div>
        <p className="text-sm text-white/25">{t('finalCta.trust')}</p>
      </div>
    </section>
  );
}
