import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Shield, FileCheck, BarChart3, Users, Bell, Award, ArrowRight, CheckCircle, Clock, AlertTriangle, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';
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

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'marketing' });
  const deadline = new Date('2026-08-02');
  const today = new Date();
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader locale={locale} />

      {/* HERO SECTION */}
      <section className="relative bg-[#0F172A] text-white py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Clock className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">{daysLeft} {t('hero.deadlineBadge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up">
            {t('hero.title')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Link href={`/${locale}/register`} className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              {t('hero.ctaPrimary')} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href={`/${locale}/pricing`} className="inline-flex items-center justify-center gap-2 border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              {t('hero.ctaSecondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500 mb-6">{t('trust.label')}</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('problem.title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('problem.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: t('problem.stat1Value'), label: t('problem.stat1Label'), sub: t('problem.stat1Sub'), icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
              { value: t('problem.stat2Value'), label: t('problem.stat2Label'), sub: t('problem.stat2Sub'), icon: Users, color: 'text-amber-500 bg-amber-50' },
              { value: t('problem.stat3Value'), label: t('problem.stat3Label'), sub: t('problem.stat3Sub'), icon: Clock, color: 'text-blue-500 bg-blue-50' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-8 rounded-2xl bg-white border shadow-sm hover:shadow-lg transition-shadow">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.color} mb-4`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('howItWorks.title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('howItWorks.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              { num: '1', title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc'), icon: Shield },
              { num: '2', title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc'), icon: BarChart3 },
              { num: '3', title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc'), icon: FileCheck },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500 text-white text-2xl font-bold mb-6">{step.num}</div>
                <step.icon className="h-8 w-8 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('features.title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('features.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: t('features.f1Title'), desc: t('features.f1Desc') },
              { icon: BarChart3, title: t('features.f2Title'), desc: t('features.f2Desc') },
              { icon: FileCheck, title: t('features.f3Title'), desc: t('features.f3Desc') },
              { icon: Users, title: t('features.f4Title'), desc: t('features.f4Desc') },
              { icon: Bell, title: t('features.f5Title'), desc: t('features.f5Desc') },
              { icon: Award, title: t('features.f6Title'), desc: t('features.f6Desc') },
            ].map((feat, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border hover:border-emerald-300 hover:shadow-lg transition-all group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-gray-600 text-sm">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BADGE SECTION */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('badge.title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('badge.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { level: t('badge.level1'), desc: t('badge.level1Desc'), color: 'border-gray-300 bg-gray-50' },
              { level: t('badge.level2'), desc: t('badge.level2Desc'), color: 'border-emerald-300 bg-emerald-50' },
              { level: t('badge.level3'), desc: t('badge.level3Desc'), color: 'border-emerald-500 bg-emerald-100' },
            ].map((b, i) => (
              <div key={i} className={`text-center p-8 rounded-2xl border-2 ${b.color}`}>
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{b.level}</h3>
                <p className="text-gray-600 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('pricing.title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('pricing.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-2xl bg-white border">
              <h3 className="text-xl font-bold mb-2">{t('pricing.free')}</h3>
              <div className="text-3xl font-bold mb-1">{t('pricing.freePrice')}</div>
              <p className="text-gray-500 text-sm mb-6">{t('pricing.freeDesc')}</p>
              <ul className="space-y-2 mb-8 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" />{t('pricing.freeFeature1')}</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" />{t('pricing.freeFeature2')}</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" />{t('pricing.freeFeature3')}</li>
              </ul>
              <Link href={`/${locale}/register`} className="block text-center py-3 rounded-lg border border-gray-300 hover:bg-gray-50 font-semibold transition-colors">{t('pricing.ctaFree')}</Link>
            </div>
            <div className="p-8 rounded-2xl bg-white border-2 border-emerald-500 relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">{t('pricing.popular')}</div>
              <h3 className="text-xl font-bold mb-2">{t('pricing.professional')}</h3>
              <div className="text-3xl font-bold mb-1">{t('pricing.proPriceMonthly')}<span className="text-base font-normal text-gray-500">/{t('pricing.perMonth')}</span></div>
              <p className="text-gray-500 text-sm mb-6">{t('pricing.proDesc')}</p>
              <ul className="space-y-2 mb-8 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" />{t('pricing.proFeature1')}</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" />{t('pricing.proFeature2')}</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" />{t('pricing.proFeature3')}</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" />{t('pricing.proFeature4')}</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" />{t('pricing.proFeature5')}</li>
              </ul>
              <Link href={`/${locale}/register`} className="block text-center py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors">{t('pricing.ctaPro')}</Link>
            </div>
            <div className="p-8 rounded-2xl bg-white border">
              <h3 className="text-xl font-bold mb-2">{t('pricing.starter')}</h3>
              <div className="text-3xl font-bold mb-1">{t('pricing.starterPriceMonthly')}<span className="text-base font-normal text-gray-500">/{t('pricing.perMonth')}</span></div>
              <p className="text-gray-500 text-sm mb-6">{t('pricing.starterDesc')}</p>
              <ul className="space-y-2 mb-8 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" />{t('pricing.starterFeature1')}</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" />{t('pricing.starterFeature2')}</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" />{t('pricing.starterFeature3')}</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" />{t('pricing.starterFeature4')}</li>
              </ul>
              <Link href={`/${locale}/register`} className="block text-center py-3 rounded-lg border border-gray-300 hover:bg-gray-50 font-semibold transition-colors">{t('pricing.ctaStarter')}</Link>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href={`/${locale}/pricing`} className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1">{t('pricing.viewAll')} <ChevronRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('testimonials.title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('testimonials.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: t('testimonials.t1Quote'), author: t('testimonials.t1Author'), role: t('testimonials.t1Role') },
              { quote: t('testimonials.t2Quote'), author: t('testimonials.t2Author'), role: t('testimonials.t2Role') },
              { quote: t('testimonials.t3Quote'), author: t('testimonials.t3Author'), role: t('testimonials.t3Role') },
            ].map((item, i) => (
              <div key={i} className="pite border">
                <div className="flex gap-1 mb-4">{[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-gray-700 mb-4 italic">&ldquo;{item.quote}&rdquo;</p>
                <div>
                  <div className="font-semibold text-gray-900">{item.author}</div>
                  <div className="text-sm text-gray-500">{item.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-emerald-600 to-teal-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('finalCta.title')}</h2>
          <p className="text-lg text-emerald-100 mb-8">{t('finalCta.subtitle')}</p>
          <Link href={`/${locale}/register`} className="inline-flex items-center gap-2 bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-bold transition-colors">
            {t('finalCta.button')} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
