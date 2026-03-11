'use client';

import { locales, localeNames, defaultLocale, type Locale } from '@/i18n/config';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value;

    // Strip current locale prefix from pathname if present
    const segments = pathname.split('/');
    const isLocaleInPath = locales.includes(segments[1] as Locale);
    const pathWithoutLocale = isLocaleInPath
      ? '/' + segments.slice(2).join('/')
      : pathname;

    // With localePrefix: 'as-needed', default locale has no prefix
    const newPath =
      newLocale === defaultLocale
        ? pathWithoutLocale || '/'
        : `/${newLocale}${pathWithoutLocale || '/'}`;

    // Full page reload for proper RTL/LTR direction switch and server component refresh
    window.location.href = newPath;
  };

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
      aria-label="Select language"
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {localeNames[loc]}
        </option>
      ))}
    </select>
  );
}
