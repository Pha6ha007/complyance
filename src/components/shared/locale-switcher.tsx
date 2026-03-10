'use client';

import { useEffect } from 'react';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  useEffect(() => {
    console.log('✅ LocaleSwitcher mounted', { locale, pathname });
  }, [locale, pathname]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value;

    console.log('🔄 Locale change:', { from: locale, to: newLocale, pathname });

    // Strip current locale from pathname
    const segments = pathname.split('/');
    const currentLocaleInPath = segments[1];

    // Check if first segment is a locale
    const isLocaleInPath = locales.includes(currentLocaleInPath as Locale);

    let pathWithoutLocale = pathname;
    if (isLocaleInPath) {
      pathWithoutLocale = '/' + segments.slice(2).join('/');
    }

    // Build new path
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    console.log('➡️ Navigating to:', newPath);

    // Force full page reload for proper RTL/LTR direction switch
    window.location.href = newPath;
  };

  const handleClick = () => {
    console.log('🖱️ Select clicked');
  };

  return (
    <select
      value={locale}
      onChange={handleChange}
      onClick={handleClick}
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
