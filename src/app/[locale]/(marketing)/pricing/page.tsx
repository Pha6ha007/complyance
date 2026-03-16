import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CheckoutButton } from '@/components/billing/checkout-button';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AnimatedGrid } from '@/components/marketing/animated-grid';
import { PricingFAQ } from '@/components/marketing/pricing-faq';

interface PricingPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PricingPageProps): Promise<Metadata> {
  const { locale } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://complyance.io';
  const canonicalUrl = `${baseUrl}/${locale}/pricing`;

  const seoContent: Record<string, { title: string; description: string }> = {
    en: {
      title: 'Pricing — Complyance | AI Compliance Platform',
      description:
        'Transparent pricing for AI compliance. Free tier available. Starter at $99/mo, Professional at $249/mo, Scale at $499/mo. 30-day money-back guarantee.',
    },
    fr: {
      title: 'Tarifs — Complyance | Plateforme de conformité IA',
      description:
        'Tarification transparente pour la conformité IA. Forfait gratuit disponible. Starter à 99 $/mois, Professional à 249 $/mois, Scale à 499 $/mois.',
    },
    de: {
      title: 'Preise — Complyance | KI-Compliance-Plattform',
      description:
        'Transparente Preise für KI-Compliance. Kostenlose Version verfügbar. Starter ab $99/Monat, Professional ab $249/Monat, Scale ab $499/Monat.',
    },
    pt: {
      title: 'Preços — Complyance | Plataforma de Conformidade de IA',
      description:
        'Preços transparentes para conformidade de IA. Plano gratuito disponível. Starter a $99/mês, Professional a $249/mês, Scale a $499/mês.',
    },
    ar: {
      title: 'الأسعار — Complyance | منصة امتثال الذكاء الاصطناعي',
      description:
        'أسعار شفافة لامتثال الذكاء الاصطناعي. خطة مجانية متاحة. Starter بـ 99 دولارًا/شهر، Professional بـ 249 دولارًا/شهر، Scale بـ 499 دولارًا/شهر.',
    },
    pl: {
      title: 'Cennik — Complyance | Platforma zgodności AI',
      description:
        'Przejrzyste ceny dla zgodności AI. Dostępny plan darmowy. Starter za $99/mies., Professional za $249/mies., Scale za $499/mies.',
    },
    it: {
      title: 'Prezzi — Complyance | Piattaforma di conformità AI',
      description:
        'Prezzi trasparenti per la conformità AI. Piano gratuito disponibile. Starter a $99/mese, Professional a $249/mese, Scale a $499/mese.',
    },
  };

  const { title, description } = seoContent[locale] || seoContent.en;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en/pricing`,
        fr: `${baseUrl}/fr/pricing`,
        de: `${baseUrl}/de/pricing`,
        pt: `${baseUrl}/pt/pricing`,
        ar: `${baseUrl}/ar/pricing`,
        pl: `${baseUrl}/pl/pricing`,
        it: `${baseUrl}/it/pricing`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale,
      url: canonicalUrl,
      siteName: 'Complyance',
      images: [
        {
          url: `${baseUrl}/og-pricing.png`,
          width: 1200,
          height: 630,
          alt: 'Complyance Pricing',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/og-pricing.png`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PricingPage({ params }: PricingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pricing');
  const tNav = await getTranslations('nav');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://complyance.io';

  // Paddle price IDs from env vars — null means no checkout button (renders link instead)
  const priceStarter = process.env.PADDLE_PRICE_STARTER ?? null;
  const priceProfessional = process.env.PADDLE_PRICE_PROFESSIONAL ?? null;
  const priceScale = process.env.PADDLE_PRICE_SCALE ?? null;

  const plans = [
    {
      name: 'Free',
      price: '0',
      period: '',
      priceId: null,
      description: t('plans.free.description'),
      features: [
        { name: t('features.systems', { count: 1 }), included: true },
        { name: t('features.regulations', { count: 1 }), included: true },
        { name: t('features.classification'), included: true },
        { name: t('features.gapAnalysis'), included: true },
        { name: t('features.badge', { level: 'Aware' }), included: true },
        { name: t('features.vendors', { count: 0 }), included: false },
        { name: t('features.documents'), included: false },
        { name: t('features.evidence'), included: false },
        { name: t('features.alerts'), included: false },
      ],
      cta: t('plans.free.cta'),
      ctaLink: '/register',
    },
    {
      name: 'Starter',
      price: '99',
      period: t('perMonth'),
      priceId: priceStarter,
      description: t('plans.starter.description'),
      popular: true,
      features: [
        { name: t('features.systems', { count: 5 }), included: true },
        { name: t('features.regulations', { count: 4 }), included: true },
        { name: t('features.classification'), included: true },
        { name: t('features.gapAnalysis'), included: true },
        { name: t('features.documents'), included: true },
        { name: t('features.vendors', { count: 2 }), included: true },
        { name: t('features.badge', { level: 'Ready' }), included: true },
        { name: t('features.alerts'), included: true, detail: t('features.alertsWeekly') },
        { name: t('features.evidence'), included: false },
        { name: t('features.biasTesting', { count: 0 }), included: false },
      ],
      cta: t('plans.starter.cta'),
    },
    {
      name: 'Professional',
      price: '249',
      period: t('perMonth'),
      priceId: priceProfessional,
      description: t('plans.professional.description'),
      features: [
        { name: t('features.systems', { count: 20 }), included: true },
        { name: t('features.regulations', { count: 0 }), included: true, detail: t('features.allRegulations') },
        { name: t('features.classification'), included: true },
        { name: t('features.gapAnalysis'), included: true },
        { name: t('features.documents'), included: true },
        { name: t('features.vendors', { count: 10 }), included: true },
        { name: t('features.evidence'), included: true },
        { name: t('features.biasTesting', { count: 3 }), included: true },
        { name: t('features.badge', { level: 'Compliant' }), included: true },
        { name: t('features.alerts'), included: true, detail: t('features.alertsRealtime') },
        { name: t('features.teamMembers', { count: 3 }), included: true },
        { name: t('features.incidents'), included: false },
      ],
      cta: t('plans.professional.cta'),
    },
    {
      name: 'Scale',
      price: '499',
      period: t('perMonth'),
      priceId: priceScale,
      description: t('plans.scale.description'),
      features: [
        { name: t('features.systems', { count: 50 }), included: true },
        { name: t('features.regulations', { count: 0 }), included: true, detail: t('features.allRegulations') },
        { name: t('features.classification'), included: true },
        { name: t('features.gapAnalysis'), included: true },
        { name: t('features.documents'), included: true },
        { name: t('features.vendors', { count: 0 }), included: true, detail: t('features.vendorsUnlimited') },
        { name: t('features.evidence'), included: true },
        { name: t('features.biasTesting', { count: 0 }), included: true, detail: t('features.biasTestingUnlimited') },
        { name: t('features.badge', { level: 'Compliant' }), included: true },
        { name: t('features.alerts'), included: true, detail: t('features.alertsRealtime') },
        { name: t('features.teamMembers', { count: 10 }), included: true },
        { name: t('features.incidents'), included: true },
        { name: t('features.gdprModule'), included: true },
        { name: t('features.cicdAPI'), included: true },
      ],
      cta: t('plans.scale.cta'),
    },
  ];

  const faqs = [
    { question: t('faq.q1.question'), answer: t('faq.q1.answer') },
    { question: t('faq.q2.question'), answer: t('faq.q2.answer') },
    { question: t('faq.q3.question'), answer: t('faq.q3.answer') },
    { question: t('faq.q4.question'), answer: t('faq.q4.answer') },
    { question: t('faq.q5.question'), answer: t('faq.q5.answer') },
    { question: t('faq.q6.question'), answer: t('faq.q6.answer') },
  ];

  // Schema.org Offers for pricing
  const offersSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Complyance AI Compliance Platform',
    provider: { '@type': 'Organization', name: 'Complyance' },
    offers: [
      { '@type': 'Offer', name: 'Free Plan', price: '0', priceCurrency: 'USD', description: '1 AI System, EU AI Act only' },
      { '@type': 'Offer', name: 'Starter Plan', price: '99', priceCurrency: 'USD', billingPeriod: 'Monthly', description: '5 AI Systems, Document Generation, 2 Vendor Assessments' },
      { '@type': 'Offer', name: 'Professional Plan', price: '249', priceCurrency: 'USD', billingPeriod: 'Monthly', description: '20 AI Systems, All Regulations, 10 Vendor Assessments, Evidence Vault, 3 Bias Tests/month' },
      { '@type': 'Offer', name: 'Scale Plan', price: '499', priceCurrency: 'USD', billingPeriod: 'Monthly', description: '50 AI Systems, Unlimited Vendors, Unlimited Bias Testing, Incident Register, CI/CD API' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offersSchema) }}
      />

      <div className="min-h-screen bg-white">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative bg-[#0F172A] overflow-hidden pt-16">
          <AnimatedGrid />
          <div className="absolute top-0 start-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 end-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_700px_350px_at_50%_58%,rgba(16,185,129,0.13),transparent)] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <p className="text-xs font-bold tracking-widest uppercase text-emerald-400 font-mono mb-6">
              {tNav('pricing')}
            </p>
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6 bg-gradient-to-r from-white via-white to-emerald-400 bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </section>

        {/* ── PRICING CARDS ────────────────────────────────── */}
        <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 flex flex-col
                    ${plan.popular
                      ? 'bg-white border-emerald-400 shadow-xl shadow-emerald-100 ring-1 ring-emerald-400/20 -translate-y-2 scale-[1.02]'
                      : 'bg-gray-50 border-gray-200 hover:border-emerald-200 hover:shadow-lg'
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 start-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-4 py-1 rounded-full font-mono uppercase tracking-wider whitespace-nowrap">
                      {t('popular')}
                    </div>
                  )}

                  <div className="mb-6">
                    <p className="text-xs font-bold tracking-widest uppercase text-gray-400 font-mono mb-2">
                      {plan.name}
                    </p>
                    <p className="text-sm text-gray-500 min-h-[2.5rem]">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-5xl font-black text-gray-900 tracking-tight">${plan.price}</span>
                    {plan.period && (
                      <span className="text-sm text-gray-400">/{plan.period}</span>
                    )}
                  </div>

                  <div className="mb-6">
                    {plan.priceId ? (
                      <CheckoutButton
                        priceId={plan.priceId}
                        planName={plan.name}
                        label={plan.cta}
                        className={`w-full rounded-xl font-bold py-3 transition-all duration-200 ${
                          plan.popular
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                            : ''
                        }`}
                        variant={plan.popular ? 'default' : 'outline'}
                      />
                    ) : (
                      <Button
                        asChild
                        className="w-full rounded-xl font-bold py-3 border border-gray-300 hover:border-emerald-400 text-gray-700 hover:text-emerald-700 bg-transparent hover:bg-transparent"
                        variant="outline"
                      >
                        <Link href={plan.ctaLink!}>{plan.cta}</Link>
                      </Button>
                    )}
                  </div>

                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        {feature.included ? (
                          <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                        ) : (
                          <X className="h-4 w-4 shrink-0 text-gray-300 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-gray-700' : 'text-gray-300 line-through'}>
                          {feature.name}
                          {'detail' in feature && feature.detail && (
                            <span className="block text-xs text-emerald-600 font-medium not-italic">
                              {feature.detail}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ENTERPRISE ───────────────────────────────────── */}
        <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 border-y border-gray-100">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold tracking-widest uppercase text-emerald-700 font-mono mb-4">
              Enterprise
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              {t('enterprise.title')}
            </h2>
            <p className="text-gray-500 mb-8 max-w-xl mx-auto">
              {t('enterprise.description')}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 border border-gray-300 hover:border-emerald-400 text-gray-700 hover:text-emerald-700 font-bold rounded-xl transition-all duration-200"
            >
              {t('enterprise.cta')} →
            </Link>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section className="bg-[#0F172A] py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_400px_at_50%_100%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="text-center mb-4">
              <p className="text-xs font-bold tracking-widest uppercase text-emerald-400 font-mono mb-4">FAQ</p>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                {t('faq.title')}
              </h2>
            </div>
            <PricingFAQ faqs={faqs} />
          </div>
        </section>

      </div>
    </>
  );
}
