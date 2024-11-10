// File: DropdownSection.jsx
import React from "react";
import Select from "react-select";

import '../style.scss';

/**
 * DropdownSection component renders a section with a title and a dropdown select element.
 * It handles loading and error states, displaying appropriate messages.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.title - The title of the section.
 * @param {Array} props.options - The options for the dropdown select.
 * @param {Object} props.selectedOption - The currently selected option.
 * @param {function} props.onChange - The function to call when the selected option changes.
 * @param {boolean} props.loading - Indicates if the data is currently loading.
 * @param {string} props.error - The error message to display if an error occurs.
 * @param {string} props.placeholder - The placeholder text for the dropdown select.
 * @param {Object} props.customStyles - Custom styles for the dropdown select.
 *
 * @returns {JSX.Element} The rendered DropdownSection component.
 */
const DropdownSection = ({
  title,
  options,
  selectedOption,
  onChange,
  loading,
  error,
  placeholder,
  classNamePrefix,
}) => {
  return (
    <section className="Section">
      <h2 className="SectionTitle">{title}</h2>
      {loading ? (
        <p className="LoadingText">Loading {title.toLowerCase()}...</p>
      ) : error ? (
        <p className="Error">{error}</p>
      ) : (
        <Select
          options={options}
          value={selectedOption}
          onChange={onChange}
          placeholder={placeholder}
          classNamePrefix={classNamePrefix}
            styles={{
                control: (provided) => ({
                    ...provided,
                    backgroundColor: 'none',
                }),
            }}
        />
      )}
    </section>
  );
};

export default DropdownSection;
