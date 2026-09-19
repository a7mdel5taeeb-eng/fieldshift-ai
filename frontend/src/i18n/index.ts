import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

export const languageStorageKey = "fieldshift-language";
const storedLanguage = typeof window === "undefined" ? null : window.localStorage.getItem(languageStorageKey);
const browserLanguage = typeof navigator === "undefined" ? "en" : navigator.language.split("-")[0];
const initialLanguage = storedLanguage === "ar" || storedLanguage === "en" ? storedLanguage : browserLanguage === "ar" ? "ar" : "en";

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
