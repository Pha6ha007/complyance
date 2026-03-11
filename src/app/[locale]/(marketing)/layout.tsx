import { ReactNode } from 'react';
import Footer from '@/components/shared/footer';
import { MarketingHeader } from '@/components/shared/marketing-header';

interface MarketingLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function MarketingLayout({ children, params }: MarketingLayoutProps) {
  const { locale } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
