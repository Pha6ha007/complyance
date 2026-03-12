'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';
import { UserMenu } from '@/components/dashboard/user-menu';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-[#0B1120] px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden text-slate-400 hover:text-white"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop spacer */}
      <div className="hidden lg:block" />

      {/* Right side - Locale switcher & user menu */}
      <div className="flex items-center gap-4">
        <LocaleSwitcher />

        <UserMenu />
      </div>
    </header>
  );
}
