import { useTranslations } from 'next-intl';

export default function RefundPage() {
  const t = useTranslations('legal.refund');

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
          </section>

          {/* 14-Day Refund */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('period.title')}</h2>
            <p className="mb-4">{t('period.p1')}</p>
            <p className="mb-4">{t('period.p2')}</p>
            <ul className="list-disc ps-6 mb-4">
              <li>{t('period.monthly')}</li>
              <li>{t('period.annual')}</li>
            </ul>
          </section>

          {/* Eligibility */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('eligibility.title')}</h2>
            <p className="mb-4">{t('eligibility.p1')}</p>
            <ul className="list-disc ps-6 mb-4">
              <li>{t('eligibility.within14')}</li>
              <li>{t('eligibility.firstTime')}</li>
              <li>{t('eligibility.noViolation')}</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">{t('eligibility.notEligible.title')}</h3>
            <ul className="list-disc ps-6 mb-4">
              <li>{t('eligibility.notEligible.after14')}</li>
              <li>{t('eligibility.notEligible.abuse')}</li>
              <li>{t('eligibility.notEligible.violation')}</li>
            </ul>
          </section>

          {/* How to Request */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('process.title')}</h2>
            <p className="mb-4">{t('process.p1')}</p>
            <ol className="list-decimal ps-6 mb-4">
              <li>{t('process.step1')}</li>
              <li>{t('process.step2')}</li>
              <li>{t('process.step3')}</li>
            </ol>
            <p className="mb-4">
              {t('process.alternative')}: <a href="mailto:support@complyance.io" className="text-primary hover:underline">support@complyance.io</a>
            </p>
          </section>

          {/* Pro-rata Refunds */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('prorata.title')}</h2>
            <p className="mb-4">{t('prorata.p1')}</p>
            <p className="mb-4">{t('prorata.example')}</p>
          </section>

          {/* Processing Time */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('processing.title')}</h2>
            <p className="mb-4">{t('processing.p1')}</p>
            <ul className="list-disc ps-6 mb-4">
              <li>{t('processing.review')}</li>
              <li>{t('processing.approval')}</li>
              <li>{t('processing.bank')}</li>
            </ul>
          </section>

          {/* Free Plan */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('free.title')}</h2>
            <p className="mb-4">{t('free.desc')}</p>
          </section>

          {/* Cancellation */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('cancellation.title')}</h2>
            <p className="mb-4">{t('cancellation.p1')}</p>
            <p className="mb-4">{t('cancellation.p2')}</p>
          </section>

          {/* EU Consumer Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('eu.title')}</h2>
            <p className="mb-4">{t('eu.p1')}</p>
            <p className="mb-4">{t('eu.p2')}</p>
          </section>

          {/* Exceptions */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('exceptions.title')}</h2>
            <p className="mb-4">{t('exceptions.p1')}</p>
            <ul className="list-disc ps-6 mb-4">
              <li>{t('exceptions.generated')}</li>
              <li>{t('exceptions.consumed')}</li>
              <li>{t('exceptions.downloaded')}</li>
            </ul>
            <p className="mb-4">{t('exceptions.p2')}</p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('contact.title')}</h2>
            <p className="mb-2">
              {t('contact.email')}: <a href="mailto:support@complyance.io" className="text-primary hover:underline">support@complyance.io</a>
            </p>
            <p className="mb-2">
              {t('contact.paddle')}: <a href="https://vendors.paddle.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">vendors.paddle.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
