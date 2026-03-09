'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Users,
  Gift,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';

interface SidebarProps {
  locale: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  {
    name: 'dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'systems',
    href: '/systems',
    icon: Server,
  },
  {
    name: 'vendors',
    href: '/vendors',
    icon: Building2,
  },
  {
    name: 'evidence',
    href: '/evidence',
    icon: FileBox,
  },
  {
    name: 'reports',
    href: '/reports',
    icon: FileText,
  },
  {
    name: 'intelligence',
    href: '/intelligence',
    icon: Bell,
  },
  {
    name: 'settings',
    href: '/settings',
    icon: Settings,
    dividerBefore: true,
  },
  {
    name: 'team',
    href: '/team',
    icon: Users,
  },
  {
    name: 'referrals',
    href: '/referrals',
    icon: Gift,
  },
];

export function Sidebar({ locale, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  // Fetch unread count for intelligence badge
  const { data: unreadData } = trpc.intelligence.getUnreadCount.useQuery(
    { personalized: true },
    { refetchInterval: 60000 } // Refetch every minute
  );
  const unreadCount = unreadData?.unread ?? 0;

  // Remove locale prefix from pathname for comparison
  const currentPath = pathname.replace(`/${locale}`, '');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 start-0 z-50 h-screen w-64 border-e bg-background transition-transform lg:sticky lg:z-auto lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'rtl:translate-x-0 rtl:start-0 rtl:end-auto',
          'rtl:[&.closed]:-translate-x-full'
        )}
      >
        {/* Logo & close button */}
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">C</span>
            </div>
            <span className="text-xl font-bold">Complyance</span>
          </Link>

          {/* Mobile close button */}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
            const showBadge = item.name === 'intelligence' && unreadCount > 0;

            return (
              <div key={item.name}>
                {item.dividerBefore && <div className="my-2 border-t" />}
                <Link
                  href={`/${locale}${item.href}`}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  )}
                  onClick={onClose}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1">{t(item.name)}</span>
                  {showBadge && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer - Plan info */}
        <div className="absolute bottom-0 start-0 w-full border-t p-4">
          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="font-medium">Free Plan</div>
            <div className="mt-1 text-xs text-muted-foreground">
              1 / 1 AI Systems
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
              <Link href={`/${locale}/pricing`}>Upgrade</Link>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
