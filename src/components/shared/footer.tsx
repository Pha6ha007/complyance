import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default async function Footer() {
  const t = await getTranslations('footer');

  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#070D1A] text-white font-dm-sans">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold tracking-tight">Complyance</span>
            </div>
            <p className="text-sm leading-relaxed text-white/40">
              AI compliance management for SaaS companies. Self-serve, affordable, built for the EU AI Act era.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 font-dm-mono text-xs font-medium uppercase tracking-widest text-white/30">
              {t('product.title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/pricing" className="text-sm text-white/50 transition-colors hover:text-white">
                  {t('product.pricing')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-white/50 transition-colors hover:text-white">
                  {t('product.blog')}
                </Link>
              </li>
              <li>
                <Link href="/free-classifier" className="text-sm text-white/50 transition-colors hover:text-white">
                  {t('product.freeClassifier')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 font-dm-mono text-xs font-medium uppercase tracking-widest text-white/30">
              {t('company.title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-white/50 transition-colors hover:text-white">
                  {t('company.about')}
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-sm text-white/50 transition-colors hover:text-white">
                  {t('company.partners')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-white/50 transition-colors hover:text-white">
                  {t('company.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-dm-mono text-xs font-medium uppercase tracking-widest text-white/30">
              {t('legal.title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-white/50 transition-colors hover:text-white">
                  {t('legal.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-white/50 transition-colors hover:text-white">
                  {t('legal.terms')}
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-sm text-white/50 transition-colors hover:text-white">
                  {t('legal.refund')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/8 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-col gap-1 text-center md:text-start">
              <p className="text-xs text-white/30">
                © {year} Complyance. All rights reserved.
              </p>
              <p className="text-xs text-white/20">
                Built for the EU AI Act (Regulation 2024/1689)
              </p>
            </div>
            <p className="text-center text-xs text-white/25 md:text-end">
              {t('disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
