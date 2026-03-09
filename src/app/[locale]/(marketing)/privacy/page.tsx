import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
  const t = useTranslations('legal.privacy');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t('lastUpdated')}: March 9, 2026
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('introduction.title')}</h2>
            <p className="mb-4">{t('introduction.p1')}</p>
            <p className="mb-4">{t('introduction.p2')}</p>
          </section>

          {/* Data Collection */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('collection.title')}</h2>
            <h3 className="text-xl font-semibold mb-3">{t('collection.account.title')}</h3>
            <ul className="list-disc ps-6 mb-4">
              <li>{t('collection.account.email')}</li>
              <li>{t('collection.account.name')}</li>
              <li>{t('collection.account.company')}</li>
              <li>{t('collection.account.markets')}</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">{t('collection.system.title')}</h3>
            <ul className="list-disc ps-6 mb-4">
              <li>{t('collection.system.descriptions')}</li>
              <li>{t('collection.system.documents')}</li>
              <li>{t('collection.system.classifications')}</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">{t('collection.technical.title')}</h3>
            <ul className="list-disc ps-6 mb-4">
              <li>{t('collection.technical.ip')}</li>
              <li>{t('collection.technical.browser')}</li>
              <li>{t('collection.technical.usage')}</li>
              <li>{t('collection.technical.errors')}</li>
            </ul>
          </section>

          {/* How We Use Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('usage.title')}</h2>
            <ul className="list-disc ps-6 mb-4">
              <li>{t('usage.service')}</li>
              <li>{t('usage.classification')}</li>
              <li>{t('usage.documents')}</li>
              <li>{t('usage.support')}</li>
              <li>{t('usage.improvements')}</li>
              <li>{t('usage.billing')}</li>
              <li>{t('usage.legal')}</li>
            </ul>
          </section>

          {/* Third Parties */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('thirdParties.title')}</h2>
            <p className="mb-4">{t('thirdParties.intro')}</p>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Anthropic (Claude API)</h3>
              <p className="text-sm text-muted-foreground mb-1">{t('thirdParties.anthropic.purpose')}</p>
              <p className="text-sm">
                <strong>{t('thirdParties.anthropic.dataShared')}:</strong> {t('thirdParties.anthropic.dataSharedDesc')}
              </p>
              <p className="text-sm">
                <strong>{t('thirdParties.anthropic.training')}:</strong> {t('thirdParties.anthropic.trainingDesc')}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">AWS S3 (or Cloudflare R2)</h3>
              <p className="text-sm text-muted-foreground mb-1">{t('thirdParties.aws.purpose')}</p>
              <p className="text-sm">
                <strong>{t('thirdParties.aws.dataShared')}:</strong> {t('thirdParties.aws.dataSharedDesc')}
              </p>
              <p className="text-sm">
                <strong>{t('thirdParties.aws.security')}:</strong> {t('thirdParties.aws.securityDesc')}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Paddle</h3>
              <p className="text-sm text-muted-foreground mb-1">{t('thirdParties.paddle.purpose')}</p>
              <p className="text-sm">
                <strong>{t('thirdParties.paddle.dataShared')}:</strong> {t('thirdParties.paddle.dataSharedDesc')}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Resend</h3>
              <p className="text-sm text-muted-foreground mb-1">{t('thirdParties.resend.purpose')}</p>
              <p className="text-sm">
                <strong>{t('thirdParties.resend.dataShared')}:</strong> {t('thirdParties.resend.dataSharedDesc')}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">PostHog</h3>
              <p className="text-sm text-muted-foreground mb-1">{t('thirdParties.posthog.purpose')}</p>
              <p className="text-sm">
                <strong>{t('thirdParties.posthog.dataShared')}:</strong> {t('thirdParties.posthog.dataSharedDesc')}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Sentry</h3>
              <p className="text-sm text-muted-foreground mb-1">{t('thirdParties.sentry.purpose')}</p>
              <p className="text-sm">
                <strong>{t('thirdParties.sentry.dataShared')}:</strong> {t('thirdParties.sentry.dataSharedDesc')}
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('cookies.title')}</h2>
            <p className="mb-4">{t('cookies.intro')}</p>
            <ul className="list-disc ps-6 mb-4">
              <li><strong>{t('cookies.essential.title')}:</strong> {t('cookies.essential.desc')}</li>
              <li><strong>{t('cookies.analytics.title')}:</strong> {t('cookies.analytics.desc')}</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('retention.title')}</h2>
            <ul className="list-disc ps-6 mb-4">
              <li><strong>{t('retention.account.title')}:</strong> {t('retention.account.desc')}</li>
              <li><strong>{t('retention.documents.title')}:</strong> {t('retention.documents.desc')}</li>
              <li><strong>{t('retention.analytics.title')}:</strong> {t('retention.analytics.desc')}</li>
              <li><strong>{t('retention.backups.title')}:</strong> {t('retention.backups.desc')}</li>
            </ul>
          </section>

          {/* GDPR Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('gdpr.title')}</h2>
            <p className="mb-4">{t('gdpr.intro')}</p>
            <ul className="list-disc ps-6 mb-4">
              <li><strong>{t('gdpr.access.title')}:</strong> {t('gdpr.access.desc')}</li>
              <li><strong>{t('gdpr.rectification.title')}:</strong> {t('gdpr.rectification.desc')}</li>
              <li><strong>{t('gdpr.erasure.title')}:</strong> {t('gdpr.erasure.desc')}</li>
              <li><strong>{t('gdpr.portability.title')}:</strong> {t('gdpr.portability.desc')}</li>
              <li><strong>{t('gdpr.objection.title')}:</strong> {t('gdpr.objection.desc')}</li>
            </ul>
            <p className="mb-4">
              {t('gdpr.exercise')} <a href="mailto:privacy@complyance.io" className="text-primary hover:underline">privacy@complyance.io</a>
            </p>
          </section>

          {/* Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('security.title')}</h2>
            <ul className="list-disc ps-6 mb-4">
              <li>{t('security.encryption')}</li>
              <li>{t('security.storage')}</li>
              <li>{t('security.access')}</li>
              <li>{t('security.monitoring')}</li>
            </ul>
          </section>

          {/* International Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('international.title')}</h2>
            <p className="mb-4">{t('international.desc')}</p>
          </section>

          {/* Children */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('children.title')}</h2>
            <p className="mb-4">{t('children.desc')}</p>
          </section>

          {/* Changes */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('changes.title')}</h2>
            <p className="mb-4">{t('changes.desc')}</p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('contact.title')}</h2>
            <p className="mb-2">
              {t('contact.email')}: <a href="mailto:privacy@complyance.io" className="text-primary hover:underline">privacy@complyance.io</a>
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
