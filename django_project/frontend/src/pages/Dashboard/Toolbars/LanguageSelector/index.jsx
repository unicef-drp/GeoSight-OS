import React, { useState } from 'react';
import Select, { components } from 'react-select';
import './style.scss';


print()

export default function LanguageSelector() {
    const [selectedLanguage, setSelectedLanguage] = useState({
        value: 'en', label: 'English (US)', code: 'US', flag: '🇺🇸'
    });

    const languageOptions = require.context("../../../../locales", true, /\.json$/);

    // const languageOptions = [
    //     { value: 'en', label: 'English (US)', code: 'US', flag: '🇺🇸' },
    //     { value: 'es', label: 'Spanish', code: 'ES', flag: '🇪🇸' },
    //     { value: 'fr', label: 'French', code: 'FR', flag: '🇫🇷' },
    //     { value: 'it', label: 'Italian', code: 'IT', flag: '🇮🇹' },
    //     { value: 'de', label: 'German', code: 'DE', flag: '🇩🇪' },
    // ];

    console.log("These language options are: ");
    console.log(languageOptions);

    const handleLanguageChange = (selectedOption) => {
        setSelectedLanguage(selectedOption);
    };

    const customOption = (props) => {
        const { data, innerRef, innerProps } = props;
        return (
            <div ref={innerRef} {...innerProps} className="custom-option">
                <span className="code">{data.code}</span>
                <span className="flag">{data.flag}</span>
                <span className="label">{data.label}</span>
            </div>
        );
    };

    const customSingleValue = ({ data }) => (
        <div className="custom-single-value">
            <span className="code">{data.code}</span>
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
