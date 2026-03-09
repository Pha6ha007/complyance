import { useTranslations } from 'next-intl';

export default function TermsPage() {
  const t = useTranslations('legal.terms');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t('lastUpdated')}: March 9, 2026
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          {/* Acceptance */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('acceptance.title')}</h2>
            <p className="mb-4">{t('acceptance.p1')}</p>
            <p className="mb-4">{t('acceptance.p2')}</p>
          </section>

          {/* Description of Service */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('service.title')}</h2>
            <p className="mb-4">{t('service.p1')}</p>
            <ul className="list-disc ps-6 mb-4">
              <li>{t('service.classification')}</li>
              <li>{t('service.gapAnalysis')}</li>
              <li>{t('service.documentGeneration')}</li>
              <li>{t('service.vendorRisk')}</li>
              <li>{t('service.evidence')}</li>
              <li>{t('service.regulatory')}</li>
            </ul>
          </section>

          {/* Disclaimer */}
          <section className="mb-8 p-6 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded">
            <h2 className="text-2xl font-semibold mb-4 text-amber-900 dark:text-amber-200">
              {t('disclaimer.title')}
            </h2>
            <p className="mb-4 text-amber-900 dark:text-amber-100">{t('disclaimer.p1')}</p>
            <p className="mb-4 text-amber-900 dark:text-amber-100">{t('disclaimer.p2')}</p>
            <p className="mb-0 text-amber-900 dark:text-amber-100">{t('disclaimer.p3')}</p>
          </section>

          {/* User Accounts */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('accounts.title')}</h2>
            <p className="mb-4">{t('accounts.p1')}</p>
            <ul className="list-disc ps-6 mb-4">
              <li>{t('accounts.accurate')}</li>
              <li>{t('accounts.confidential')}</li>
              <li>{t('accounts.notify')}</li>
              <li>{t('accounts.responsible')}</li>
            </ul>
          </section>

          {/* Subscriptions and Billing */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('billing.title')}</h2>

            <h3 className="text-xl font-semibold mb-3">{t('billing.plans.title')}</h3>
            <p className="mb-4">{t('billing.plans.desc')}</p>

            <h3 className="text-xl font-semibold mb-3">{t('billing.payment.title')}</h3>
            <p className="mb-4">{t('billing.payment.desc')}</p>

            <h3 className="text-xl font-semibold mb-3">{t('billing.renewal.title')}</h3>
            <p className="mb-4">{t('billing.renewal.desc')}</p>

            <h3 className="text-xl font-semibold mb-3">{t('billing.changes.title')}</h3>
            <p className="mb-4">{t('billing.changes.desc')}</p>

            <h3 className="text-xl font-semibold mb-3">{t('billing.cancellation.title')}</h3>
            <p className="mb-4">{t('billing.cancellation.desc')}</p>
          </section>

          {/* Acceptable Use */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('use.title')}</h2>
            <p className="mb-4">{t('use.intro')}</p>
            <ul className="list-disc ps-6 mb-4">
              <li>{t('use.violate')}</li>
              <li>{t('use.harmful')}</li>
              <li>{t('use.infringe')}</li>
              <li>{t('use.interfere')}</li>
              <li>{t('use.reverse')}</li>
              <li>{t('use.scrape')}</li>
              <li>{t('use.resell')}</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('ip.title')}</h2>

            <h3 className="text-xl font-semibold mb-3">{t('ip.ownership.title')}</h3>
            <p className="mb-4">{t('ip.ownership.desc')}</p>

            <h3 className="text-xl font-semibold mb-3">{t('ip.userContent.title')}</h3>
            <p className="mb-4">{t('ip.userContent.desc')}</p>

            <h3 className="text-xl font-semibold mb-3">{t('ip.license.title')}</h3>
            <p className="mb-4">{t('ip.license.desc')}</p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('liability.title')}</h2>
            <p className="mb-4">{t('liability.p1')}</p>
            <p className="mb-4">{t('liability.p2')}</p>
          </section>

          {/* Indemnification */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('indemnification.title')}</h2>
            <p className="mb-4">{t('indemnification.desc')}</p>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('termination.title')}</h2>
            <p className="mb-4">{t('termination.p1')}</p>
            <p className="mb-4">{t('termination.p2')}</p>
            <p className="mb-4">{t('termination.p3')}</p>
          </section>

          {/* Data Deletion */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('deletion.title')}</h2>
            <p className="mb-4">{t('deletion.p1')}</p>
            <p className="mb-4">{t('deletion.p2')}</p>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('law.title')}</h2>
            <p className="mb-4">{t('law.desc')}</p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('changes.title')}</h2>
            <p className="mb-4">{t('changes.desc')}</p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('contact.title')}</h2>
            <p className="mb-2">
              {t('contact.email')}: <a href="mailto:support@complyance.io" className="text-primary hover:underline">support@complyance.io</a>
            </p>
            <p className="mb-2">
              {t('contact.website')}: <a href="https://complyance.io" className="text-primary hover:underline">complyance.io</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
