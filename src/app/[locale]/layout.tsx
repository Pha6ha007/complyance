import type { Metadata } from 'next';
import { Inter, DM_Sans, DM_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { isRtlLocale } from '@/i18n/config';
import { Toaster } from '@/components/ui/toaster';
import { PHProvider } from '@/components/shared/posthog-provider';
import { PaddleProvider } from '@/components/shared/paddle-provider';
import { TRPCProvider } from '@/lib/trpc/provider';
import { SessionProvider } from '@/components/shared/session-provider';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://complyance.io';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Complyance | AI Compliance Management Platform',
    template: '%s — Complyance',
  },
  description:
    'Self-serve AI compliance platform for SMBs. Classify AI systems, identify gaps, and achieve EU AI Act compliance.',
  keywords: [
    'EU AI Act', 'AI compliance', 'AI risk classification', 'AI regulation',
    'Annex III', 'high-risk AI', 'compliance platform', 'SaaS compliance',
  ],
  authors: [{ name: 'Complyance' }],
  creator: 'Complyance',
  openGraph: {
    type: 'website',
    siteName: 'Complyance',
    title: 'Complyance | AI Compliance Management Platform',
    description:
      'Self-serve AI compliance platform for SMBs. Classify AI systems, identify gaps, and achieve EU AI Act compliance.',
    url: baseUrl,
    images: [
      {
        url: `${baseUrl}/api/og`,
        width: 1200,
        height: 630,
        alt: 'Complyance — AI Compliance Platform',
      },
    ],
    locale: 'en',
    alternateLocale: ['fr', 'de', 'pt', 'ar', 'pl', 'it'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Complyance | AI Compliance Management Platform',
    description:
      'Self-serve AI compliance platform for SMBs. Classify AI systems, identify gaps, and achieve EU AI Act compliance.',
    images: [`${baseUrl}/api/og`],
    creator: '@complyance_io',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
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
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const dir = isRtlLocale(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className={`${inter.className} ${dmSans.variable} ${dmMono.variable} bg-[#0F172A]`}>
        <SessionProvider>
          <TRPCProvider>
            <PaddleProvider>
              <PHProvider>
                <NextIntlClientProvider messages={messages}>
                  {children}
                  <Toaster />
                </NextIntlClientProvider>
              </PHProvider>
            </PaddleProvider>
          </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
