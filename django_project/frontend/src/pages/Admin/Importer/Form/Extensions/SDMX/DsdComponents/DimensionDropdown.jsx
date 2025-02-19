// File: DimensionDropdown.jsx
import React from "react";

import FormControl from "@mui/material/FormControl";
import Select from "react-select";
import { ArrowDownwardIcon } from "../../../../../../../components/Icons";

import '../style.scss';


/**
 * DimensionDropdown component renders a dropdown for selecting multiple values for a given dimension.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.dimensionId - The ID of the dimension.
 * @param {Array} props.options - The array of options to be displayed in the dropdown.
 * @param {Array} props.selectedValues - The array of selected values.
 * @param {Function} props.onChange - The callback function to handle changes in the selected options.
 * @param {Object} [props.customStyles] - Optional custom styles to be applied to the dropdown.
 *
 * @returns {JSX.Element} The rendered DimensionDropdown component.
 */
const DimensionDropdown = ({
  dimensionId,
  options,
  selectedValues,
  onChange,
}) => (
  <div className="DimensionContainer">
    <label className="form-label" id={dimensionId}>
      {dimensionId}
    </label>

    <FormControl className='InputControl'>
      <Select
        isMulti
        options={options}
        value={options.filter((option) => selectedValues.includes(option.value))}
        onChange={(selectedOptions) => onChange(dimensionId, selectedOptions)}
        placeholder={`Select ${dimensionId}`}
        className={"DimensionDropdown"}
        classNamePrefix={"DimensionDropdown"}
        formatOptionLabel={(option) => `${option.label} [${option.value}]`}
        styles={{
          control: (provided) => ({
            ...provided,
          }),
        }}
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator: () => <div className='DropdownIndicator'>
            <ArrowDownwardIcon /></div>,
        }}
      />
    </FormControl>
  </div>
);

export default DimensionDropdown;