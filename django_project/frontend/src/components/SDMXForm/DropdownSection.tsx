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
import { Select } from "../Input/index";
import { Option } from "./types";

interface Props {
  title: string;
  options: Option[];
  selectedOption: Option | null;
  onChange: (option: Option) => void;
  loading?: boolean;
  error?: string;
  classNamePrefix?: string;
}

const DropdownSection = ({
  title,
  options,
  selectedOption,
  onChange,
  loading,
  error,
  classNamePrefix,
}: Props) => {
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
        <FormControl className="InputControl">
          <Select
            menuPlacement={"auto"}
            options={options}
            value={selectedOption}
            getOptionLabel={(option: Option) => {
              if (option.value === option.label) return option.label;
              return `${option.label} [${option.value}]`;
            }}
            getOptionValue={(option: Option) => option.value}
            classNamePrefix={classNamePrefix}
            styles={{
              control: (provided: any) => ({
                ...provided,
                backgroundColor: "none",
              }),
            }}
            onChange={onChange}
            placeholder={options.length ? "Select..." : "No options available"}
            aria-labelledby={title}
          />
        </FormControl>
      )}
    </section>
  );
};

export default DropdownSection;
