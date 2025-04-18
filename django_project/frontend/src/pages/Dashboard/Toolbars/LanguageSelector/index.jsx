import React, { useState } from 'react';
import Select from 'react-select';
import './style.scss';

export default function LanguageSelector() {
    const [selectedLanguage, setSelectedLanguage] = useState({ value: 'en', label: 'English' });

    const languageOptions = [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' },
    ];

    const handleLanguageChange = (selectedOption) => {
        setSelectedLanguage(selectedOption);
    };

    return (
        <div className="language-selector">
            <label htmlFor="language-selector">Select Language: </label>
            <Select
                inputId="language-selector"
                value={selectedLanguage}
                onChange={handleLanguageChange}
                options={languageOptions}
                classNamePrefix="react-select"
            />
        </div>
    );
}
