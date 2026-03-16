'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Server,
  Building2,
  FileBox,
  FileText,
  Bell,
  Settings,
  Gift,
  BookOpen,
  X,
  Zap,
  BarChart3,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

interface SidebarProps {
  locale: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  { name: 'dashboard',    href: '/dashboard',   icon: LayoutDashboard },
  { name: 'systems',      href: '/systems',      icon: Server },
  { name: 'vendors',      href: '/vendors',      icon: Building2 },
  { name: 'evidence',     href: '/evidence',     icon: FileBox },
  { name: 'reports',      href: '/reports',      icon: FileText },
  { name: 'intelligence', href: '/intelligence', icon: Bell },
  { name: 'biasTesting',  href: '/bias-testing',  icon: BarChart3 },
  { name: 'blog',         href: '/blog',         icon: BookOpen, external: true },
  { name: 'settings',     href: '/settings',     icon: Settings, dividerBefore: true },
  { name: 'referrals',    href: '/referrals',    icon: Gift },
];

export function Sidebar({ locale, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const { data: unreadData } = trpc.intelligence.getUnreadCount.useQuery(
    { personalized: true },
    { refetchInterval: 60000 }
  );
  const unreadCount = unreadData?.unread ?? 0;

  const { data: pendingData } = trpc.referral.getPendingCount.useQuery(
    undefined,
    { refetchInterval: 60000 }
  );
  const pendingCount = pendingData?.count ?? 0;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        style={{ height: 'calc(100vh / 0.85)' }}
        className={cn(
          'fixed top-0 start-0 z-50 w-64 transition-transform lg:sticky lg:z-auto lg:translate-x-0',
          'bg-[#0B1120] border-e border-slate-800',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
              <span className="text-sm font-bold text-white">C</span>
            </div>
            <span className="text-lg font-bold text-white">Complyance</span>
          </Link>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-0.5 p-3 mt-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const showIntelligenceBadge = item.name === 'intelligence' && unreadCount > 0;
            const showReferralsBadge = item.name === 'referrals' && pendingCount > 0;

            return (
              <div key={item.name}>
                {item.dividerBefore && (
                  <div className="my-3 border-t border-slate-800" />
                )}
                <Link
                  href={item.href}
                  onClick={onClose}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.6)]' : 'text-slate-500')} />
                  <span className="flex-1">{t(item.name)}</span>
                  {showIntelligenceBadge && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-xs font-bold text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  {showReferralsBadge && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Plan info — bottom */}
        <div className="absolute bottom-0 start-0 w-full border-t border-slate-800 p-4">
          <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-white">Free Plan</span>
            </div>
            <div className="text-xs text-slate-400 mb-3">1 / 1 AI Systems</div>
            <div className="w-full bg-slate-700 rounded-full h-1 mb-3">
              <div className="bg-emerald-500 h-1 rounded-full w-full" />
            </div>
            <Link
              href="/pricing"
              className="block w-full rounded-lg bg-emerald-500/10 border border-emerald-500/30
                px-3 py-1.5 text-center text-xs font-semibold text-emerald-400
                hover:bg-emerald-500/20 transition-colors"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
