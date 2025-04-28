import React, { useState } from 'react';
import Select from 'react-select';
import './style.scss';
import { languages, changeLanguage, getCurrentLanguage } from '../../utils/i18n';


print()

export default function LanguageSelector() {
    const currentLanguageCode = getCurrentLanguage();

    const languageOptions = Object.keys(languages).map((key) => ({
        value: key,
        label: languages[key].name,
        code: key,
        flag: languages[key].flag,
    }));

    const [selectedLanguage, setSelectedLanguage] = useState(languageOptions.find((lang) => lang.value === currentLanguageCode));

    const handleLanguageChange = (lang) => {
        setSelectedLanguage(lang);
        changeLanguage(lang.code);
        console.log("CHANGED TO: " + lang.code)
    };

    const customOption = (props) => {
        const { data, innerRef, innerProps } = props;
        return (
            <div ref={innerRef} {...innerProps} className="custom-option">
                <span className="code">{data.code.toUpperCase()}</span>
                <span className="flag">{data.flag}</span>
                <span className="label">{data.label}</span>
            </div>
        );
    };

    const customSingleValue = ({ data }) => (
        <div className="custom-single-value">
            <span className="code">{data.code.toUpperCase()}</span>
            <span className="flag">{data.flag}</span>
            <span className="label">{data.label}</span>
        </div>
    );

    return (
        <div className="language-selector">
            <Select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                options={languageOptions}
                components={{ Option: customOption, SingleValue: customSingleValue }}
                classNamePrefix="react-select"
                menuPlacement="auto"
            />

        </div>
    );
}
