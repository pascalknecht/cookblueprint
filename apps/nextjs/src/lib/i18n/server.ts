import { cookies } from 'next/headers';
import i18next from 'i18next';

import { DEFAULT_LOCALE, LOCALE_COOKIE, isSupportedLocale, type AppLocale } from './config';
import { de } from './de';
import { en } from './en';

export async function getLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getServerTranslator(locale?: AppLocale) {
  const resolvedLocale = locale ?? (await getLocale());
  const instance = i18next.createInstance();
  await instance.init({
    lng: resolvedLocale,
    fallbackLng: DEFAULT_LOCALE,
    resources: { en: { translation: en }, de: { translation: de } },
    interpolation: { escapeValue: false },
  });
  return instance.t;
}
