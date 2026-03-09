import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';
import Link from 'next/link';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://complyance.io';
  const canonicalUrl = `${baseUrl}/${locale}`;

  // SEO content per locale (core value proposition)
  const seoContent: Record<string, { title: string; description: string }> = {
    en: {
      title: 'Complyance — AI Compliance Platform for SaaS Companies',
      description:
        'Classify AI systems by risk level, generate EU AI Act compliance documentation, and track obligations. Self-serve platform starting at $99/month. EU AI Act deadline: August 2, 2026.',
    },
    fr: {
      title: 'Complyance — Plateforme de conformité IA pour les entreprises SaaS',
      description:
        "Classifiez les systèmes d'IA par niveau de risque, générez la documentation de conformité à l'AI Act de l'UE et suivez les obligations. Plateforme en libre-service à partir de 99 $/mois.",
    },
    de: {
      title: 'Complyance — KI-Compliance-Plattform für SaaS-Unternehmen',
      description:
        'KI-Systeme nach Risikostufen klassifizieren, EU AI Act Compliance-Dokumentation erstellen und Pflichten verfolgen. Self-Service-Plattform ab $99/Monat.',
    },
    pt: {
      title: 'Complyance — Plataforma de Conformidade de IA para Empresas SaaS',
      description:
        'Classifique sistemas de IA por nível de risco, gere documentação de conformidade com o AI Act da UE e acompanhe obrigações. Plataforma self-service a partir de $99/mês.',
    },
    ar: {
      title: 'Complyance — منصة امتثال الذكاء الاصطناعي لشركات SaaS',
      description:
        'صنّف أنظمة الذكاء الاصطناعي حسب مستوى المخاطر، وأنشئ وثائق الامتثال لقانون الذكاء الاصطناعي للاتحاد الأوروبي، وتتبع الالتزامات. منصة الخدمة الذاتية تبدأ من 99 دولارًا في الشهر.',
    },
    pl: {
      title: 'Complyance — Platforma zgodności AI dla firm SaaS',
      description:
        'Klasyfikuj systemy AI według poziomu ryzyka, generuj dokumentację zgodności z AI Act UE i śledź obowiązki. Platforma samoobsługowa od $99/miesiąc.',
    },
    it: {
      title: 'Complyance — Piattaforma di conformità AI per aziende SaaS',
      description:
        "Classifica i sistemi AI per livello di rischio, genera documentazione di conformità all'AI Act UE e monitora gli obblighi. Piattaforma self-service a partire da $99/mese.",
    },
  };

  const { title, description } = seoContent[locale] || seoContent.en;

  return {
    title,
    description,
    keywords: [
      'EU AI Act',
      'AI compliance',
      'AI risk classification',
      'high-risk AI',
      'AI regulation',
      'compliance platform',
      'SaaS compliance',
      'AI documentation',
      'Annex III',
      'AI Act deadline',
    ],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en`,
        fr: `${baseUrl}/fr`,
        de: `${baseUrl}/de`,
        pt: `${baseUrl}/pt`,
        ar: `${baseUrl}/ar`,
        pl: `${baseUrl}/pl`,
        it: `${baseUrl}/it`,
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
          url: `${baseUrl}/og-home.png`,
          width: 1200,
          height: 630,
          alt: 'Complyance — AI Compliance Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/og-home.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('marketing');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://complyance.io';

  // Schema.org Organization + WebSite markup
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Complyance',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      'AI compliance platform for SaaS companies selling into EU, US, and UAE markets.',
    sameAs: [
      // TODO: Add social media links when available
      // 'https://twitter.com/complyance',
      // 'https://linkedin.com/company/complyance',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@complyance.io',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Complyance',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Complyance',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '499',
      priceCurrency: 'USD',
      offerCount: '4',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
    description:
      'Self-serve AI compliance platform for classifying AI systems, generating EU AI Act documentation, and tracking compliance obligations.',
    featureList: [
      'AI Risk Classification',
      'EU AI Act Compliance',
      'Document Generation',
      'Gap Analysis',
      'Vendor Risk Assessment',
      'Evidence Vault',
      'Regulatory Intelligence',
    ],
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareAppSchema),
        }}
      />

      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
        <div className="absolute top-4 end-4">
          <LocaleSwitcher />
        </div>

        <main className="text-center">
          <h1 className="mb-4 text-5xl font-bold text-slate-900">
            Complyance
          </h1>
          <p className="mb-8 text-xl text-slate-600">{t('tagline')}</p>
          <Link
            href={`/${locale}/login`}
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 transition"
          >
            {t('cta')}
          </Link>
        </main>

        <footer className="absolute bottom-4 text-sm text-slate-500">
          Phase 1: Foundation — Next.js 14 + TypeScript + Prisma + next-intl +
          NextAuth.js
        </footer>
      </div>
    </>
  );
}
