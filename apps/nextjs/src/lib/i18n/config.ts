export const SUPPORTED_LOCALES = ['en', 'de'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = 'en';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isSupportedLocale(value: string | undefined | null): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}
