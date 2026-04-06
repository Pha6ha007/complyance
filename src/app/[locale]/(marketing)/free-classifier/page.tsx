import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FreeClassifierClient } from './client';

interface FreeClassifierPageProps {
  params: Promise<{ locale: string }>;
  // `?shared=high|unacceptable|limited|minimal` — set when a user shares
  // their classification result. Used by generateMetadata to render a
  // result-specific OG card so the link preview is contextual.
  searchParams?: Promise<{ shared?: string }>;
}

const SHARED_RISK_LEVELS = ['unacceptable', 'high', 'limited', 'minimal'] as const;
type SharedRiskLevel = (typeof SHARED_RISK_LEVELS)[number];

function parseSharedRisk(value: string | undefined): SharedRiskLevel | null {
  if (!value) return null;
  const lower = value.toLowerCase();
  return (SHARED_RISK_LEVELS as readonly string[]).includes(lower)
    ? (lower as SharedRiskLevel)
    : null;
}

export async function generateMetadata({
  params,
  searchParams,
}: FreeClassifierPageProps): Promise<Metadata> {
  const { locale } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const sharedRisk = parseSharedRisk(sp?.shared);

  const t = await getTranslations({ locale, namespace: 'freeClassifier' });
  const tShare = await getTranslations({ locale, namespace: 'freeClassifier.share' });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://complyance.app';
  const canonicalUrl = `${baseUrl}/${locale}/free-classifier`;

  // When a result is shared, generate a tailored OG card. Otherwise fall
  // back to the static page-level metadata.
  let title: string;
  let description: string;
  let ogImage: string;

  if (sharedRisk) {
    const ogTitleKey =
      sharedRisk === 'high'
        ? 'ogTitleHigh'
        : sharedRisk === 'unacceptable'
          ? 'ogTitleUnacceptable'
          : sharedRisk === 'limited'
            ? 'ogTitleLimited'
            : 'ogTitleMinimal';
    title = tShare(ogTitleKey);
    description = tShare('ogDescription');
    ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`;
  } else {
    title = t('seo.title');
    description = t('seo.description');
    ogImage = `${baseUrl}/og-free-classifier.png`;
  }

  return {
    title,
    description,
    alternates: {
      // Canonical always points at the bare classifier — share variants
      // are duplicates of the same page, not separate routes.
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
      title,
      description,
      type: 'website',
      locale: locale,
      url: canonicalUrl,
      siteName: 'Complyance',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
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
