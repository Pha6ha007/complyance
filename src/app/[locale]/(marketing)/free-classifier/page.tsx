import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FreeClassifierClient } from './client';

interface FreeClassifierPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: FreeClassifierPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'freeClassifier' });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://complyance.app';
  const canonicalUrl = `${baseUrl}/${locale}/free-classifier`;

  return {
    title: t('seo.title'),
    description: t('seo.description'),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: '/en/free-classifier',
        fr: '/fr/free-classifier',
        de: '/de/free-classifier',
        pt: '/pt/free-classifier',
        ar: '/ar/free-classifier',
        pl: '/pl/free-classifier',
        it: '/it/free-classifier',
      },
    },
    openGraph: {
      title: t('seo.title'),
      description: t('seo.description'),
      type: 'website',
      locale: locale,
      url: canonicalUrl,
      siteName: 'Complyance',
      images: [
        {
          url: `${baseUrl}/og-free-classifier.png`,
          width: 1200,
          height: 630,
          alt: t('seo.title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('seo.title'),
      description: t('seo.description'),
      images: [`${baseUrl}/og-free-classifier.png`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function FreeClassifierPage({
  params,
}: FreeClassifierPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'freeClassifier' });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://complyance.app';

  // Schema.org WebApplication markup
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t('seo.title'),
    description: t('seo.description'),
    url: `${baseUrl}/${locale}/free-classifier`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: 'Complyance',
      url: baseUrl,
    },
    featureList: [
      'AI Risk Classification',
      'EU AI Act Compliance Check',
      'Instant Results',
      'No Registration Required',
    ],
  };

  // Schema.org FAQPage markup for SEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the EU AI Act?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The EU AI Act is the first comprehensive AI regulation in the world. It classifies AI systems into risk categories (Unacceptable, High, Limited, Minimal) and sets compliance requirements for high-risk AI systems.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my AI system high-risk under the EU AI Act?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'High-risk AI systems include those used in HR/recruitment, education, credit scoring, law enforcement, and critical infrastructure. AI systems that profile users are always considered high-risk under Article 6(3).',
        },
      },
      {
        '@type': 'Question',
        name: 'When is the EU AI Act deadline?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The EU AI Act high-risk compliance deadline is August 2, 2026. Companies deploying high-risk AI systems in the EU must comply with Articles 9-15 by this date.',
        },
      },
    ],
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webAppSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <FreeClassifierClient />
    </>
  );
}
