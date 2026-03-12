'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';

interface MarketingHeaderProps {
  locale: string;
}

export function MarketingHeader({ locale }: MarketingHeaderProps) {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 font-dm-sans ${
        scrolled
          ? 'bg-[#0F172A]/95 backdrop-blur-md border-b border-white/6'
          : 'bg-[#0F172A]/85 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">Complyance</span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/pricing"
            className="text-sm font-medium text-white/60 transition-colors duration-150 hover:text-white"
          >
            Pricing
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-white/60 transition-colors duration-150 hover:text-white"
          >
            {t('blog')}
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-white/60 transition-colors duration-150 hover:text-white"
          >
            About
          </Link>
        </nav>

        {/* CTA + locale */}
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/login"
            className="hidden text-sm font-medium text-white/60 transition-colors hover:text-white md:block"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_4px_24px_rgba(16,185,129,0.5)]"
          >
            Get Started Free
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
