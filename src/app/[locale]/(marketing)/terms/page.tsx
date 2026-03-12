import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.terms' });
  return { title: `${t('title')} — Complyance` };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'legal.terms' });

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
      <div className="absolute top-0 start-0 w-[500px] h-[500px] bg-teal-500/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 sm:px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white font-dm-sans">{t('title')}</h1>
          <p className="mt-2 text-sm text-white/30">{t('lastUpdated')}: March 9, 2026</p>
        </div>

        <div className="space-y-10">
          {/* Acceptance */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('acceptance.title')}</h2>
            <p className="mb-3 text-sm text-white/65 leading-relaxed">{t('acceptance.p1')}</p>
            <p className="text-sm text-white/65 leading-relaxed">{t('acceptance.p2')}</p>
          </section>

          {/* Service */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('service.title')}</h2>
            <p className="mb-4 text-sm text-white/65 leading-relaxed">{t('service.p1')}</p>
            <ul className="space-y-1.5 ps-4">
              {[t('service.classification'), t('service.gapAnalysis'), t('service.documentGeneration'), t('service.vendorRisk'), t('service.evidence'), t('service.regulatory')].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Disclaimer — amber callout */}
          <section>
            <div className="rounded-r-xl border-s-4 border-amber-400 bg-amber-400/8 px-6 py-5">
              <h2 className="mb-4 text-xl font-bold text-amber-200">{t('disclaimer.title')}</h2>
              <p className="mb-3 text-sm text-amber-100/80 leading-relaxed">{t('disclaimer.p1')}</p>
              <p className="mb-3 text-sm text-amber-100/80 leading-relaxed">{t('disclaimer.p2')}</p>
              <p className="text-sm text-amber-100/80 leading-relaxed">{t('disclaimer.p3')}</p>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('accounts.title')}</h2>
            <p className="mb-4 text-sm text-white/65 leading-relaxed">{t('accounts.p1')}</p>
            <ul className="space-y-1.5 ps-4">
              {[t('accounts.accurate'), t('accounts.confidential'), t('accounts.notify'), t('accounts.responsible')].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-400" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Billing */}
          <section>
            <h2 className="mb-5 text-xl font-bold text-white">{t('billing.title')}</h2>
            <div className="space-y-4">
              {[
                { title: t('billing.plans.title'), desc: t('billing.plans.desc') },
                { title: t('billing.payment.title'), desc: t('billing.payment.desc') },
                { title: t('billing.renewal.title'), desc: t('billing.renewal.desc') },
                { title: t('billing.changes.title'), desc: t('billing.changes.desc') },
                { title: t('billing.cancellation.title'), desc: t('billing.cancellation.desc') },
              ].map(({ title, desc }) => (
                <div key={title} className="rounded-xl border border-white/8 bg-white/4 px-5 py-4">
                  <h3 className="mb-1.5 font-semibold text-white/90">{title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('use.title')}</h2>
            <p className="mb-4 text-sm text-white/65 leading-relaxed">{t('use.intro')}</p>
            <ul className="space-y-1.5 ps-4">
              {[t('use.violate'), t('use.harmful'), t('use.infringe'), t('use.interfere'), t('use.reverse'), t('use.scrape'), t('use.resell')].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* IP */}
          <section>
            <h2 className="mb-5 text-xl font-bold text-white">{t('ip.title')}</h2>
            <div className="space-y-4">
              {[
                { title: t('ip.ownership.title'), desc: t('ip.ownership.desc') },
                { title: t('ip.userContent.title'), desc: t('ip.userContent.desc') },
                { title: t('ip.license.title'), desc: t('ip.license.desc') },
              ].map(({ title, desc }) => (
                <div key={title} className="rounded-xl border border-white/8 bg-white/4 px-5 py-4">
                  <h3 className="mb-1.5 font-semibold text-white/90">{title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Liability — amber callout */}
          <section>
            <div className="rounded-r-xl border-s-4 border-amber-400 bg-amber-400/8 px-6 py-5">
              <h2 className="mb-4 text-xl font-bold text-amber-200">{t('liability.title')}</h2>
              <p className="mb-3 text-sm text-amber-100/80 leading-relaxed">{t('liability.p1')}</p>
              <p className="text-sm text-amber-100/80 leading-relaxed">{t('liability.p2')}</p>
            </div>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('indemnification.title')}</h2>
            <p className="text-sm text-white/65 leading-relaxed">{t('indemnification.desc')}</p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('termination.title')}</h2>
            <p className="mb-3 text-sm text-white/65 leading-relaxed">{t('termination.p1')}</p>
            <p className="mb-3 text-sm text-white/65 leading-relaxed">{t('termination.p2')}</p>
            <p className="text-sm text-white/65 leading-relaxed">{t('termination.p3')}</p>
          </section>

          {/* Data Deletion */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('deletion.title')}</h2>
            <p className="mb-3 text-sm text-white/65 leading-relaxed">{t('deletion.p1')}</p>
            <p className="text-sm text-white/65 leading-relaxed">{t('deletion.p2')}</p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('law.title')}</h2>
            <p className="text-sm text-white/65 leading-relaxed">{t('law.desc')}</p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('changes.title')}</h2>
            <p className="text-sm text-white/65 leading-relaxed">{t('changes.desc')}</p>
          </section>

          {/* Contact */}
          <section className="rounded-xl border border-white/10 bg-white/4 px-6 py-5">
            <h2 className="mb-3 text-xl font-bold text-white">{t('contact.title')}</h2>
            <p className="text-sm text-white/60">
              {t('contact.email')}:{' '}
              <a href="mailto:support@complyance.io" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                support@complyance.io
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
