// File: DropdownSection.jsx
import React from "react";
import '../style.scss';

import FormControl from "@mui/material/FormControl";
import { Select } from "../../../../../../../components/Input/index";

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
  classNamePrefix,
}) => {

  return (
    <section className="BasicFormSection">
      <label className="form-label required" id={title}>
        {title}
      </label>

      {loading ? (
        <p className="LoadingText">Loading {title.toLowerCase()}...</p>
      ) : error ? (
        <p className="Error">{error}</p>
      ) : (
        <FormControl className='InputControl'>
          <Select
            menuPlacement={'auto'}
            options={options}
            value={selectedOption}
            getOptionLabel={(option) => `${option.label} [${option.value}]`}
            getOptionValue={(option) => option.value}
            classNamePrefix={classNamePrefix}
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: 'none',
              }),
            }}
            onChange={onChange}
            placeholder="Select..."
            aria-labelledby={title}
          />
        </FormControl>
      )}
    </section>
  );
};



export default DropdownSection;



