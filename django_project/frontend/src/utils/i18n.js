import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const translationFiles = require.context('../../locales/react/', true, /\.json$/);
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

// Format language code to proper case (e.g., "en-us" to "en-US")
function formatLanguageCode(code) {
  const formattedCode = languageCodes.find(
    langCode => langCode.toLowerCase().replace(/[-_]/g, '') === code.toLowerCase().replace(/[-_]/g, '')
  );
  return formattedCode || code;
}

function formatLanguageCodeUrl(code) {
  return code.toLowerCase()
}

// Get current language from URL
export const getCurrentLanguage = () => {
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 1 && languageCodes.includes(formatLanguageCode(pathParts[1]))) {
        return formatLanguageCode(pathParts[1]);
    }
    return 'en-US';
};

// Change language and update URL
export const changeLanguage = (newLang) => {
    if (languageCodes.includes(newLang)) {
        const pathParts = window.location.pathname.split('/');
        let newPath;

        // If current path already has a language code
        if (pathParts.length > 1 && languageCodes.includes(formatLanguageCode(pathParts[1]))) {
            pathParts[1] = formatLanguageCodeUrl(newLang);
            newPath = pathParts.join('/');
        } else {
            // If no language code in path, insert it at the beginning
            newPath = `/${formatLanguageCodeUrl(newLang)}${window.location.pathname}`;
        }

        // Change the language in i18n
        i18n.changeLanguage(newLang);

        // Update the URL and reload the page to trigger Django's language change
        window.location.href = newPath;
    }
};

// Initialize i18n with the current language from URL
const currentLanguage = getCurrentLanguage();
i18n
    .use(initReactI18next)
    .init({
        debug: true,
        resources,
        lng: currentLanguage,
        fallbackLng: 'en-US',
        interpolation: {
            escapeValue: false
        }
    });