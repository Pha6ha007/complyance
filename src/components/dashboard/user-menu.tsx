'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const name = session?.user?.name || session?.user?.email || 'U';
  const initial = name.charAt(0).toUpperCase();
  const email = session?.user?.email || '';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white hover:bg-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        aria-label="User menu"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute end-0 top-10 z-50 w-56 rounded-xl border border-slate-700/50 bg-[#0B1120] shadow-xl shadow-black/40 py-1">
          {/* User info */}
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="text-sm font-semibold text-white truncate">{name}</div>
            {email && email !== name && (
              <div className="text-xs text-slate-400 truncate">{email}</div>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-500" />
              Settings
            </Link>
            <Link
              href="/settings/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
            >
              <User className="h-4 w-4 text-slate-500" />
              Profile
            </Link>
          </div>

          <div className="border-t border-slate-800 py-1">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4 text-slate-500" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
