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
 * __date__ = '13/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from 'react';
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

import FormControl from "@mui/material/FormControl";
import { dictDeepCopy } from "../../utils/main";

/** Main button
 * @param {string} buttonProps Variant of Button.
 * @param {list} list List of data.
 * @param {str} value Value of data.
 * @param {boolean} showFloatingLabel Showing floating label.
 * @param {boolean} createable Is value createable.
 */
export function SelectWithList(
  {
    list,
    value,
    showFloatingLabel = false,
    createable = false,
    keepData = false,
    ...props
  }) {
  let defaultValue = null
  if (props.isMulti) {
    defaultValue = []
  }
  const options = []
  if (list) {
    list.map((row, idx) => {
      const option = {
        value: row.value !== undefined ? row.value : row,
        label: row.name !== undefined ? row.name : row.label !== undefined ? row.label : row
      }
      if (keepData) {
        option.data = dictDeepCopy(row)
      }
      if (!props.isMulti) {
        if ((value !== undefined && value === option.value) || (props.required && idx === 0)) {
          defaultValue = option
        }
      } else {
        if ((value !== undefined && value.includes(option.value)) || (props.required && idx === 0)) {
          defaultValue.push(option)
        }
      }
      options.push(option)
    })
  }

  let SelectComponent = Select;
  if (createable) {
    SelectComponent = CreatableSelect;
  }
  return (
    <FormControl className='InputControl'>
      <SelectComponent
        menuPlacement={props.menuPlacement ? props.menuPlacement : 'auto'}
        className={'SelectWithList ' + props.ClassName + (createable ? ' Creatable ' : '')}
        options={options} value={defaultValue} {...props}
        styles={{
          menu: (baseStyles, state) => ({
            ...baseStyles,
            zIndex: 2
          }),
        }}
      />
      {
        showFloatingLabel ?
          <label
            className="SelectWithListLabel MuiFormLabel-root"
            style={{ zIndex: 0 }}
            data-shrink="true">{props.placeholder}</label>
          : null
      }
    </FormControl>
  )
}