import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: require('../locales/en/common.json') }
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });