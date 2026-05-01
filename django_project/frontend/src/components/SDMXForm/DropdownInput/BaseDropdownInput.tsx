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
 * __date__ = '30/04/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */
import React, { useEffect, useState } from "react";
import FormControl from "@mui/material/FormControl";

import { MainDropdownProps } from "./types";
import { Select } from "../../Input";
import { SelectOption } from "../../../types/Input";

/**
 * Controlled single-select dropdown backed by an Option list.
 * Clears the selection when the current value is no longer in options.
 */
export const DropdownInput = ({
  title,
  options,

  loading,
  error,

  selectedValue,
  onChangeValue,
  disabled,
}: MainDropdownProps) => {
  const [value, setValue] = useState<SelectOption | null>(null);

  // When loading, clear selection
  useEffect(() => {
    if (loading) {
      setValue(null);
      if (selectedValue !== null) {
        onChangeValue(null);
      }
    }
  }, [loading]);

  // When selected changed
  useEffect(() => {
    const option =
      options.find((option) => option.value === selectedValue) ?? null;
    if (!option && selectedValue) {
      onChangeValue(null);
    }
    if (option?.value !== value?.value) {
      setValue(option);
    }
  }, [options, selectedValue]);

  // When value changed
  useEffect(() => {
    const _value: string | null = !value?.value ? null : value?.value;
    if (_value !== selectedValue) {
      onChangeValue(_value);
    }
  }, [value]);

  return (
    <section className="BasicFormSection">
      <label className="form-label required">{title}</label>
      <FormControl className="InputControl">
        <Select
          disabled={disabled}
          menuPlacement={"top"}
          options={[...options].sort((a, b) => a.label.localeCompare(b.label))}
          value={value}
          getOptionLabel={(option: SelectOption) => {
            if (option.value === option.label) return option.label;
            return `${option.label} [${option.value}]`;
          }}
          getOptionValue={(option: SelectOption) => option.value}
          styles={{
            control: (provided: any) => ({
              ...provided,
              backgroundColor: "none",
            }),
            menuList: (provided: any) => ({
              ...provided,
              maxHeight: "200px",
            }),
          }}
          onChange={setValue}
          placeholder={
            loading
              ? "Loading..."
              : !options.length
                ? "No options available"
                : "Select..."
          }
          aria-labelledby={title}
        />
        {error && <span className="form-helptext error">{error}</span>}
      </FormControl>
    </section>
  );
};
