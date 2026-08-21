import * as Localization from "expo-localization";
import { ExtensionStorage } from "@bacons/apple-targets";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { Platform } from "react-native";

import { secureStorage } from "@/lib/secure-storage";
import { WIDGET_APP_GROUP } from "@/widgets/widget-names";
import { de } from "./de";
import { en } from "./en";

export const SUPPORTED_LOCALES = ["en", "de"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_STORAGE_KEY = "mise.locale";

function isSupportedLocale(
  value: string | null | undefined,
): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

function resolveInitialLocale(): AppLocale {
  const stored = secureStorage.getItem(LOCALE_STORAGE_KEY);
  if (isSupportedLocale(stored)) return stored;

  const deviceLanguage = Localization.getLocales()[0]?.languageCode;
  return isSupportedLocale(deviceLanguage) ? deviceLanguage : "en";
}

function syncWidgetLocale(locale: AppLocale) {
  if (Platform.OS !== "ios") return;
  new ExtensionStorage(WIDGET_APP_GROUP).set("locale", locale);
}

const initialLocale = resolveInitialLocale();

i18next.use(initReactI18next).init({
  resources: { en: { translation: en }, de: { translation: de } },
  lng: initialLocale,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});
syncWidgetLocale(initialLocale);

export function setAppLocale(locale: AppLocale) {
  i18next.changeLanguage(locale);
  secureStorage.setItem(LOCALE_STORAGE_KEY, locale);
  syncWidgetLocale(locale);
  if (Platform.OS === "ios") ExtensionStorage.reloadWidget();
}

export default i18next;
