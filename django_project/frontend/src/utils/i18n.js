import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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
    languages[lang] = {
        name: resources[lang].translation.native.name,
        flag: resources[lang].translation.native.flag
    };
});

// Get current language from URL
export const getCurrentLanguage = () => {
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 1 && languageCodes.includes(pathParts[1])) {
        return pathParts[1];
    }
    return 'en';
};

// Change language and update URL
export const changeLanguage = (newLang) => {
    if (languageCodes.includes(newLang)) {
        const pathParts = window.location.pathname.split('/');
        let newPath;

        // If current path already has a language code
        if (pathParts.length > 1 && languageCodes.includes(pathParts[1])) {
            pathParts[1] = newLang;
            newPath = pathParts.join('/');
        } else {
            // If no language code in path, insert it at the beginning
            newPath = `/${newLang}${window.location.pathname}`;
        }

        // Change the language in i18n
        i18n.changeLanguage(newLang);

        // Update the URL without reloading the page
        window.history.pushState({}, '', newPath);
    }
};

// Initialize i18n with the current language from URL
const currentLanguage = getCurrentLanguage();
i18n
    .use(initReactI18next)
    .init({
        debug: false,
        resources,
        lng: currentLanguage,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });