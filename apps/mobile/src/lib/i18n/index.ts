import * as Localization from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { secureStorage } from '@/lib/secure-storage';
import { de } from './de';
import { en } from './en';

export const SUPPORTED_LOCALES = ['en', 'de'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_STORAGE_KEY = 'mise.locale';

function isSupportedLocale(value: string | null | undefined): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

function resolveInitialLocale(): AppLocale {
  const stored = secureStorage.getItem(LOCALE_STORAGE_KEY);
  if (isSupportedLocale(stored)) return stored;

  const deviceLanguage = Localization.getLocales()[0]?.languageCode;
  return isSupportedLocale(deviceLanguage) ? deviceLanguage : 'en';
}

i18next.use(initReactI18next).init({
  resources: { en: { translation: en }, de: { translation: de } },
  lng: resolveInitialLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function setAppLocale(locale: AppLocale) {
  i18next.changeLanguage(locale);
  secureStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export default i18next;
