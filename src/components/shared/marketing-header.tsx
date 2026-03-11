import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';

interface MarketingHeaderProps {
  locale: string;
}

export async function MarketingHeader({ locale }: MarketingHeaderProps) {
  const t = await getTranslations('nav');

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href={`/${locale}`}
          className="text-xl font-bold"
        >
          Complyance
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href={`/${locale}/pricing`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href={`/${locale}/blog`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('blog')}
          </Link>
          <Link
            href={`/${locale}/about`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </Link>
          <Link
            href={`/${locale}/login`}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Log in
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
