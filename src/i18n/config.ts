export const locales = ['en', 'fr', 'de', 'pt', 'ar', 'pl', 'it'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ar: 'العربية',
  pl: 'Polski',
  it: 'Italiano',
};

export const rtlLocales: Locale[] = ['ar'];

export function isRtlLocale(locale: string): boolean {
  return rtlLocales.includes(locale as Locale);
}
