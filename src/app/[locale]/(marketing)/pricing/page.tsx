import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { CheckoutButton } from '@/components/billing/checkout-button';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

  const t = useTranslations('pricing');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://complyance.io';

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
        { name: t('features.vendors'), included: false },
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
      priceId: 'pri_01j...starter', // TODO: Replace with actual Paddle price ID
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
        { name: t('features.biasTesting'), included: false },
      ],
      cta: t('plans.starter.cta'),
    },
    {
      name: 'Professional',
      price: '249',
      period: t('perMonth'),
      priceId: 'pri_01j...professional', // TODO: Replace with actual Paddle price ID
      description: t('plans.professional.description'),
      features: [
        { name: t('features.systems', { count: 20 }), included: true },
        { name: t('features.regulations'), included: true, detail: t('features.allRegulations') },
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
      priceId: 'pri_01j...scale', // TODO: Replace with actual Paddle price ID
      description: t('plans.scale.description'),
      features: [
        { name: t('features.systems', { count: 50 }), included: true },
        { name: t('features.regulations'), included: true, detail: t('features.allRegulations') },
        { name: t('features.classification'), included: true },
        { name: t('features.gapAnalysis'), included: true },
        { name: t('features.documents'), included: true },
        { name: t('features.vendors'), included: true, detail: t('features.vendorsUnlimited') },
        { name: t('features.evidence'), included: true },
        { name: t('features.biasTesting'), included: true, detail: t('features.biasTestingUnlimited') },
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
    {
      question: t('faq.q1.question'),
      answer: t('faq.q1.answer'),
    },
    {
      question: t('faq.q2.question'),
      answer: t('faq.q2.answer'),
    },
    {
      question: t('faq.q3.question'),
      answer: t('faq.q3.answer'),
    },
    {
      question: t('faq.q4.question'),
      answer: t('faq.q4.answer'),
    },
    {
      question: t('faq.q5.question'),
      answer: t('faq.q5.answer'),
    },
    {
      question: t('faq.q6.question'),
      answer: t('faq.q6.answer'),
    },
  ];

  // Schema.org Offers for pricing
  const offersSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Complyance AI Compliance Platform',
    provider: {
      '@type': 'Organization',
      name: 'Complyance',
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        price: '0',
        priceCurrency: 'USD',
        description: '1 AI System, EU AI Act only',
      },
      {
        '@type': 'Offer',
        name: 'Starter Plan',
        price: '99',
        priceCurrency: 'USD',
        billingPeriod: 'Monthly',
        description: '5 AI Systems, Document Generation, 2 Vendor Assessments',
      },
      {
        '@type': 'Offer',
        name: 'Professional Plan',
        price: '249',
        priceCurrency: 'USD',
        billingPeriod: 'Monthly',
        description:
          '20 AI Systems, All Regulations, 10 Vendor Assessments, Evidence Vault, 3 Bias Tests/month',
      },
      {
        '@type': 'Offer',
        name: 'Scale Plan',
        price: '499',
        priceCurrency: 'USD',
        billingPeriod: 'Monthly',
        description:
          '50 AI Systems, Unlimited Vendors, Unlimited Bias Testing, Incident Register, CI/CD API',
      },
    ],
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(offersSchema),
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md ${
                plan.popular
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {t('popular')}
                </div>
              )}

              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">/{plan.period}</span>
                )}
              </div>

              <div className="mt-6">
                {plan.priceId ? (
                  <CheckoutButton
                    priceId={plan.priceId}
                    planName={plan.name}
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                  />
                ) : (
                  <Button asChild className="w-full" variant="outline">
                    <Link href={plan.ctaLink!}>{plan.cta}</Link>
                  </Button>
                )}
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    {feature.included ? (
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                    ) : (
                      <X className="h-5 w-5 shrink-0 text-muted-foreground/50" />
                    )}
                    <span
                      className={
                        feature.included
                          ? 'text-foreground'
                          : 'text-muted-foreground/50 line-through'
                      }
                    >
                      {feature.name}
                      {'detail' in feature && feature.detail && (
                        <span className="block text-xs text-muted-foreground">
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

        {/* Enterprise CTA */}
        <div className="mt-16 rounded-lg border bg-card p-8 text-center shadow-sm">
          <h3 className="text-2xl font-bold">{t('enterprise.title')}</h3>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            {t('enterprise.description')}
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link href="/contact">{t('enterprise.cta')}</Link>
          </Button>
        </div>
      </div>

      {/* FAQ */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-center text-3xl font-bold">
            {t('faq.title')}
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {faqs.map((faq, i) => (
              <div key={i}>
                <h3 className="text-lg font-semibold">{faq.question}</h3>
                <p className="mt-2 text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
