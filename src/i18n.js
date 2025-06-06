// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./locales/en/translation.json";
import translationES from "./locales/es/translation.json";
import translationCA from "./locales/ca/translation.json";

const savedLang = localStorage.getItem("i18nextLng") || "ca";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEN },
      es: { translation: translationES },
      ca: { translation: translationCA }
    },
    lng: savedLang,
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
