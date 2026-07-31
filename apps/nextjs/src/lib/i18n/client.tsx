'use client';

import { useState, type ReactNode } from 'react';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import { de } from './de';
import { en } from './en';
import { DEFAULT_LOCALE, type AppLocale } from './config';

function createI18nInstance(initialLocale: AppLocale) {
  const instance = i18next.createInstance();
  instance.use(initReactI18next).init({
    lng: initialLocale,
    fallbackLng: DEFAULT_LOCALE,
    resources: { en: { translation: en }, de: { translation: de } },
    interpolation: { escapeValue: false },
  });
  return instance;
}

export function I18nProvider({ initialLocale, children }: { initialLocale: AppLocale; children: ReactNode }) {
  const [instance] = useState(() => createI18nInstance(initialLocale));
  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
