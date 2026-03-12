import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.refund' });
  return { title: `${t('title')} — Complyance` };
}

export default async function RefundPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'legal.refund' });

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
      <div className="absolute bottom-0 end-1/4 w-[400px] h-[400px] bg-emerald-500/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 sm:px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white font-dm-sans">{t('title')}</h1>
          <p className="mt-2 text-sm text-white/30">{t('lastUpdated')}: March 9, 2026</p>
        </div>

        <div className="space-y-10">
          {/* Introduction */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('introduction.title')}</h2>
            <p className="text-sm text-white/65 leading-relaxed">{t('introduction.p1')}</p>
          </section>

          {/* 14-Day Refund — emerald callout */}
          <section>
            <div className="rounded-r-xl border-s-4 border-emerald-500 bg-emerald-500/10 px-6 py-5">
              <h2 className="mb-4 text-xl font-bold text-emerald-200">{t('period.title')}</h2>
              <p className="mb-3 text-sm text-white/75 leading-relaxed">{t('period.p1')}</p>
              <p className="mb-3 text-sm text-white/75 leading-relaxed">{t('period.p2')}</p>
              <ul className="space-y-1.5 ps-2">
                <li className="flex items-start gap-2 text-sm text-white/70">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                  {t('period.monthly')}
                </li>
                <li className="flex items-start gap-2 text-sm text-white/70">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                  {t('period.annual')}
                </li>
              </ul>
            </div>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('eligibility.title')}</h2>
            <p className="mb-4 text-sm text-white/65 leading-relaxed">{t('eligibility.p1')}</p>

            <div className="mb-4 rounded-r-xl border-s-4 border-emerald-500 bg-emerald-500/8 px-5 py-4">
              <ul className="space-y-1.5">
                {[t('eligibility.within14'), t('eligibility.firstTime'), t('eligibility.noViolation')].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <h3 className="mb-3 font-semibold text-white/85">{t('eligibility.notEligible.title')}</h3>
            <div className="rounded-r-xl border-s-4 border-red-400 bg-red-400/8 px-5 py-4">
              <ul className="space-y-1.5">
                {[t('eligibility.notEligible.after14'), t('eligibility.notEligible.abuse'), t('eligibility.notEligible.violation')].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* How to Request */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('process.title')}</h2>
            <p className="mb-4 text-sm text-white/65 leading-relaxed">{t('process.p1')}</p>
            <ol className="space-y-3">
              {[t('process.step1'), t('process.step2'), t('process.step3')].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                    {i + 1}
                  </span>
                  <span className="text-sm text-white/65 leading-relaxed pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-white/55">
              {t('process.alternative')}:{' '}
              <a href="mailto:support@complyance.io" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                support@complyance.io
              </a>
            </p>
          </section>

          {/* Pro-rata */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('prorata.title')}</h2>
            <p className="mb-3 text-sm text-white/65 leading-relaxed">{t('prorata.p1')}</p>
            <div className="rounded-xl border border-white/8 bg-white/4 px-5 py-3">
              <p className="text-sm text-white/55 italic">{t('prorata.example')}</p>
            </div>
          </section>

          {/* Processing Time */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('processing.title')}</h2>
            <p className="mb-4 text-sm text-white/65 leading-relaxed">{t('processing.p1')}</p>
            <ul className="space-y-1.5 ps-4">
              {[t('processing.review'), t('processing.approval'), t('processing.bank')].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-400" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Free Plan */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('free.title')}</h2>
            <p className="text-sm text-white/65 leading-relaxed">{t('free.desc')}</p>
          </section>

          {/* Cancellation */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('cancellation.title')}</h2>
            <p className="mb-3 text-sm text-white/65 leading-relaxed">{t('cancellation.p1')}</p>
            <p className="text-sm text-white/65 leading-relaxed">{t('cancellation.p2')}</p>
          </section>

          {/* EU Consumer Rights — sky callout */}
          <section>
            <div className="rounded-r-xl border-s-4 border-sky-400 bg-sky-400/8 px-6 py-5">
              <h2 className="mb-4 text-xl font-bold text-sky-200">{t('eu.title')}</h2>
              <p className="mb-3 text-sm text-white/70 leading-relaxed">{t('eu.p1')}</p>
              <p className="text-sm text-white/70 leading-relaxed">{t('eu.p2')}</p>
            </div>
          </section>

          {/* Exceptions */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">{t('exceptions.title')}</h2>
            <p className="mb-4 text-sm text-white/65 leading-relaxed">{t('exceptions.p1')}</p>
            <ul className="space-y-1.5 ps-4 mb-4">
              {[t('exceptions.generated'), t('exceptions.consumed'), t('exceptions.downloaded')].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm text-white/65 leading-relaxed">{t('exceptions.p2')}</p>
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
              {t('contact.paddle')}:{' '}
              <a href="https://vendors.paddle.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                vendors.paddle.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
