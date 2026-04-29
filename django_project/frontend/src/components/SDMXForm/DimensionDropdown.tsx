/**
 * GeoSight is UNICEF's geospatial web-based business intelligence platform.
 *
 * Contact : geosight-no-reply@unicef.org
 *
 * .. note:: This program is free software; you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation; either version 3 of the License, or
 *     (at your option) any later version.
 *
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '29/04/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */
import React from "react";
import FormControl from "@mui/material/FormControl";
import Select, { MultiValue, StylesConfig } from "react-select";
import { ArrowDownwardIcon } from "../Icons";
import { Option } from "./types";

interface Props {
  dimensionId: string;
  options: Option[];
  selectedValues: string[];
  onChange: (dimensionId: string, selectedOptions: MultiValue<Option>) => void;
}

const DimensionDropdown = ({
  dimensionId,
  options,
  selectedValues,
  onChange,
}: Props) => (
  <div className="DimensionContainer">
    <label className="form-label" id={dimensionId}>
      {dimensionId}
    </label>

    <FormControl className="InputControl">
      <Select
        isMulti
        options={options}
        value={options.filter((option) =>
          selectedValues.includes(option.value),
        )}
        onChange={(selectedOptions) => onChange(dimensionId, selectedOptions)}
        placeholder={`Select ${dimensionId}`}
        className="DimensionDropdown"
        classNamePrefix="DimensionDropdown"
        formatOptionLabel={(option: Option) =>
          `${option.label} [${option.value}]`
        }
        styles={
          {
            control: (provided) => ({ ...provided }),
          } as StylesConfig<Option, true>
        }
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator: () => (
            <div className="DropdownIndicator">
              <ArrowDownwardIcon />
            </div>
          ),
        }}
      />
    </FormControl>
  </div>
);

export default DimensionDropdown;
