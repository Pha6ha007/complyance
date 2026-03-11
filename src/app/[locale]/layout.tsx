import type { Metadata } from 'next';
import { Inter, DM_Sans, DM_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { isRtlLocale } from '@/i18n/config';
import { Toaster } from '@/components/ui/toaster';
import { PHProvider } from '@/components/shared/posthog-provider';
import { PaddleProvider } from '@/components/shared/paddle-provider';
import { TRPCProvider } from '@/lib/trpc/provider';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Complyance | AI Compliance Management Platform',
  description:
    'Self-serve AI compliance platform for SMBs. Classify AI systems, identify gaps, and achieve EU AI Act compliance.',
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
      <body className={`${inter.className} ${dmSans.variable} ${dmMono.variable}`}>
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
      </body>
    </html>
  );
}
