
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./i18n/locales/en.json";
import al from "./i18n/locales/al.json";

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        al: { translation: al },
    },
    lng: "al", // default language
    fallbackLng: "en",
    interpolation: {
        escapeValue: false, // React already protects from XSS
    },
});

export default i18n;
