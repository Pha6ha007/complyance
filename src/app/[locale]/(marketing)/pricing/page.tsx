import { useTranslations } from 'next-intl';
import { CheckoutButton } from '@/components/billing/checkout-button';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PricingPage() {
  const t = useTranslations('pricing');

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

  return (
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
                      {feature.detail && (
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
  );
}
