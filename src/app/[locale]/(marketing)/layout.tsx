import { ReactNode } from 'react';
import Footer from '@/components/shared/footer';

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen">
      {/* Marketing header can be added here in the future */}
      <main>{children}</main>
      <Footer />
    </div>
  );
}
