import { ReactNode } from 'react';

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen">
      {/* Marketing header can be added here in the future */}
      <main>{children}</main>
      {/* Marketing footer can be added here in the future */}
    </div>
  );
}
