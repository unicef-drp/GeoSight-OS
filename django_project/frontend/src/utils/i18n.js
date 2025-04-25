import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const translationFiles = require.context('../locales', true, /\.json$/);
const resources = {};
const languageCodes = translationFiles.keys().map(key => key.split('/')[1]);
languageCodes.forEach(lang => {
    resources[lang] = {
        translation: translationFiles(`./${lang}/common.json`)
    };
});

export const languages = {};
languageCodes.forEach(lang => {
    languages[lang] = resources[lang].translation.nativeName;
});


i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });