import React, { useState } from 'react';
import { GlobeIcon } from '../Icons';
import CustomPopover from '../CustomPopover';
import { PluginChild } from '../../pages/Dashboard/MapLibre/Plugin';
import { languages, changeLanguage, getCurrentLanguage } from '../../utils/i18n';

import './style.scss';

/** Language Selector component. */
export default function LanguageSelector({ children }) {
    const currentLanguageId = getCurrentLanguage();

    const languageOptions = Object.keys(languages).map((key) => ({
        value: key,
        name: languages[key].name,
        id: key,
        flag: languages[key].flag,
    }));

    const [selectedLanguage, setSelectedLanguage] = useState(languageOptions.find((lang) => lang.value === currentLanguageId));

    return <>
        <CustomPopover
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            Button={children}
        >
            <div className='LanguageSelectorComponent'>
                <div className='language-options-list'>
                    {languageOptions.map(lang => (
                        <div
                            key={lang.id}
                            className={'language-option' + (lang.id === selectedLanguage.id ? ' selected' : '')}
                            onClick={() => {
                                setSelectedLanguage(lang);
                                changeLanguage(lang.id);
                            }}
                            tabIndex={0}
                            role="button"
                        >
                            <span className="flag">{lang.flag}</span>
                            <span className="name">{lang.name}</span>
                            {lang.id === selectedLanguage.id && <span className="checkmark">✔</span>}
                        </div>
                    ))}
                </div>
            </div>
        </CustomPopover>
    </>
}