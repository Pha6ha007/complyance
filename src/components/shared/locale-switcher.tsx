'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { ChevronDown, Check } from 'lucide-react';

const LOCALES = [
  { code: 'en', name: 'English',   flag: '🇬🇧' },
  { code: 'fr', name: 'Français',  flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch',   flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'العربية',   flag: '🇦🇪' },
  { code: 'pl', name: 'Polski',    flag: '🇵🇱' },
  { code: 'it', name: 'Italiano',  flag: '🇮🇹' },
];

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLocale = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20
          border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white
          transition-colors cursor-pointer select-none"
      >
        <span className="text-base leading-none">{currentLocale.flag}</span>
        <span className="font-medium hidden sm:inline">{currentLocale.name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              onClick={() => switchLocale(loc.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm
                hover:bg-slate-50 transition-colors text-start
                ${locale === loc.code
                  ? 'text-emerald-600 font-medium bg-emerald-50/60'
                  : 'text-slate-700'}`}
            >
              <span className="text-base">{loc.flag}</span>
              <span>{loc.name}</span>
              {locale === loc.code && (
                <Check className="w-3.5 h-3.5 ms-auto text-emerald-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
