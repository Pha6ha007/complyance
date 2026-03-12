import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.privacy' });
  return { title: `${t('title')} — Complyance` };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'legal.privacy' });

  return (
    <div className="relative min-h-screen bg-[#0F172A] overflow-hidden">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          animation: 'gridShift 20s linear infinite',
        }}
      />
      <div className="absolute top-0 end-0 w-[500px] h-[500px] bg-emerald-500/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 sm:px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white font-dm-sans">{t('title')}</h1>
          <p className="mt-2 text-sm text-white/30">{t('lastUpdated')}: March 9, 2026</p>
        </div>

        <div className="space-y-10">
          {/* Introduction — emerald callout */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('introduction.title')}</h2>
            <div className="rounded-r-xl border-s-4 border-emerald-500 bg-emerald-500/8 px-6 py-4">
              <p className="mb-3 text-white/80 leading-relaxed">{t('introduction.p1')}</p>
              <p className="text-white/80 leading-relaxed">{t('introduction.p2')}</p>
            </div>
          </section>

          {/* Data Collection */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('collection.title')}</h2>
            <div className="space-y-5">
              <div>
                <h3 className="mb-2 font-semibold text-white/90">{t('collection.account.title')}</h3>
                <ul className="space-y-1.5 ps-4">
                  {[t('collection.account.email'), t('collection.account.name'), t('collection.account.company'), t('collection.account.markets')].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-white/90">{t('collection.system.title')}</h3>
                <ul className="space-y-1.5 ps-4">
                  {[t('collection.system.descriptions'), t('collection.system.documents'), t('collection.system.classifications')].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-white/90">{t('collection.technical.title')}</h3>
                <ul className="space-y-1.5 ps-4">
                  {[t('collection.technical.ip'), t('collection.technical.browser'), t('collection.technical.usage'), t('collection.technical.errors')].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Data */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('usage.title')}</h2>
            <ul className="space-y-1.5 ps-4">
              {[t('usage.service'), t('usage.classification'), t('usage.documents'), t('usage.support'), t('usage.improvements'), t('usage.billing'), t('usage.legal')].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-400" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Third Parties */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('thirdParties.title')}</h2>
            <p className="mb-5 text-sm text-white/60 leading-relaxed">{t('thirdParties.intro')}</p>

            {/* Anthropic — amber callout (AI data sharing) */}
            <div className="mb-4 rounded-r-xl border-s-4 border-amber-400 bg-amber-400/8 px-5 py-4">
              <h3 className="font-semibold text-white/90">Anthropic (Claude API)</h3>
              <p className="mt-1 text-sm text-white/50">{t('thirdParties.anthropic.purpose')}</p>
              <p className="mt-2 text-sm text-white/70"><span className="font-medium text-white/80">{t('thirdParties.anthropic.dataShared')}:</span> {t('thirdParties.anthropic.dataSharedDesc')}</p>
              <p className="mt-1 text-sm text-white/70"><span className="font-medium text-white/80">{t('thirdParties.anthropic.training')}:</span> {t('thirdParties.anthropic.trainingDesc')}</p>
            </div>

            <div className="space-y-3">
              {[
                { name: 'AWS S3 / Cloudflare R2', purpose: t('thirdParties.aws.purpose'), shared: `${t('thirdParties.aws.dataShared')}: ${t('thirdParties.aws.dataSharedDesc')}` },
                { name: 'Paddle', purpose: t('thirdParties.paddle.purpose'), shared: `${t('thirdParties.paddle.dataShared')}: ${t('thirdParties.paddle.dataSharedDesc')}` },
                { name: 'Resend', purpose: t('thirdParties.resend.purpose'), shared: `${t('thirdParties.resend.dataShared')}: ${t('thirdParties.resend.dataSharedDesc')}` },
                { name: 'PostHog', purpose: t('thirdParties.posthog.purpose'), shared: `${t('thirdParties.posthog.dataShared')}: ${t('thirdParties.posthog.dataSharedDesc')}` },
                { name: 'Sentry', purpose: t('thirdParties.sentry.purpose'), shared: `${t('thirdParties.sentry.dataShared')}: ${t('thirdParties.sentry.dataSharedDesc')}` },
              ].map(({ name, purpose, shared }) => (
                <div key={name} className="rounded-xl border border-white/8 bg-white/4 px-5 py-4">
                  <h3 className="font-semibold text-white/90">{name}</h3>
                  <p className="mt-1 text-sm text-white/45">{purpose}</p>
                  <p className="mt-1.5 text-sm text-white/65">{shared}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('cookies.title')}</h2>
            <p className="mb-4 text-sm text-white/60 leading-relaxed">{t('cookies.intro')}</p>
            <ul className="space-y-1.5 ps-4">
              <li className="flex items-start gap-2 text-sm text-white/60">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                <span><span className="font-medium text-white/80">{t('cookies.essential.title')}:</span> {t('cookies.essential.desc')}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/60">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                <span><span className="font-medium text-white/80">{t('cookies.analytics.title')}:</span> {t('cookies.analytics.desc')}</span>
              </li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('retention.title')}</h2>
            <ul className="space-y-1.5 ps-4">
              {[
                [t('retention.account.title'), t('retention.account.desc')],
                [t('retention.documents.title'), t('retention.documents.desc')],
                [t('retention.analytics.title'), t('retention.analytics.desc')],
                [t('retention.backups.title'), t('retention.backups.desc')],
              ].map(([title, desc]) => (
                <li key={title} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-400" />
                  <span><span className="font-medium text-white/80">{title}:</span> {desc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* GDPR Rights — blue callout */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('gdpr.title')}</h2>
            <div className="rounded-r-xl border-s-4 border-sky-400 bg-sky-400/8 px-6 py-5">
              <p className="mb-4 text-sm text-white/70 leading-relaxed">{t('gdpr.intro')}</p>
              <ul className="space-y-2">
                {[
                  [t('gdpr.access.title'), t('gdpr.access.desc')],
                  [t('gdpr.rectification.title'), t('gdpr.rectification.desc')],
                  [t('gdpr.erasure.title'), t('gdpr.erasure.desc')],
                  [t('gdpr.portability.title'), t('gdpr.portability.desc')],
                  [t('gdpr.objection.title'), t('gdpr.objection.desc')],
                ].map(([title, desc]) => (
                  <li key={title} className="flex items-start gap-2 text-sm text-white/65">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-400" />
                    <span><span className="font-medium text-white/85">{title}:</span> {desc}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-white/60">
                {t('gdpr.exercise')}{' '}
                <a href="mailto:privacy@complyance.io" className="text-sky-400 hover:text-sky-300 transition-colors">
                  privacy@complyance.io
                </a>
              </p>
            </div>
          </section>

          {/* Security — emerald callout */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('security.title')}</h2>
            <div className="rounded-r-xl border-s-4 border-emerald-500 bg-emerald-500/8 px-6 py-4">
              <ul className="space-y-1.5">
                {[t('security.encryption'), t('security.storage'), t('security.access'), t('security.monitoring')].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* International */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('international.title')}</h2>
            <p className="text-sm text-white/60 leading-relaxed">{t('international.desc')}</p>
          </section>

          {/* Children */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('children.title')}</h2>
            <p className="text-sm text-white/60 leading-relaxed">{t('children.desc')}</p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('changes.title')}</h2>
            <p className="text-sm text-white/60 leading-relaxed">{t('changes.desc')}</p>
          </section>

          {/* Contact */}
          <section className="rounded-xl border border-white/10 bg-white/4 px-6 py-5">
            <h2 className="mb-3 text-xl font-bold text-white">{t('contact.title')}</h2>
            <p className="text-sm text-white/60">
              {t('contact.email')}:{' '}
              <a href="mailto:privacy@complyance.io" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                privacy@complyance.io
              </a>
            </p>
            <p className="mt-1.5 text-sm text-white/60">
              {t('contact.website')}:{' '}
              <Link href="/" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                complyance.io
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
