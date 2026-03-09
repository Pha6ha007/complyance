'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop spacer */}
      <div className="hidden lg:block" />

      {/* Right side - Locale switcher & user menu */}
      <div className="flex items-center gap-4">
        <LocaleSwitcher />

        {/* TODO: Add user menu dropdown */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          U
        </div>
      </div>
    </header>
  );
}
