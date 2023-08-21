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

import React, { useState } from 'react';
import FormControl from "@mui/material/FormControl";
import CustomPopover from "../../../../components/CustomPopover";
import { IconTextField } from "../../../../components/Elements/Input";
import { FilterIcon } from "../../../../components/Icons";
import { Creatable } from "../../../../components/Input";

/**
 * Filter group
 * @param {str} title Place holder.
 * @param {array} data Selected data.
 * @param {function} setData When the value changed.
 * @param {Boolean} returnObject Is data returned whole object.
 */
export function MultipleCreatableFilter(
  { title, data, setData, returnObject }
) {
  return <CustomPopover
    className={'PopoverFilterControl'}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    Button={
      <FormControl className='FilterControl'>
        {
          data.length ?
            <label
              className="MuiFormLabel-root"
              data-shrink="true">{title}</label>
            : ""
        }
        <IconTextField
          iconEnd={<FilterIcon/>}
          value={data.length ? data.length + ' selected' : title}
          inputProps={
            { readOnly: true, }
          }
        />
      </FormControl>
    }>
    <MultipleCreatable
      data={
        data.map(label => {
          return {
            label,
            value: label
          }
        })
      }
      setData={(data) => {
        setData(data.map(row => row.value))
      }}/>
  </CustomPopover>
}

/**
 * Multiple Creatable component
 */
export function MultipleCreatable({ data, setData }) {
  const [inputValue, setInputValue] = useState('');
  const components = {
    DropdownIndicator: null,
  };

  const createOption = (label) => ({
    label,
    value: label,
  });

  const handleKeyDown = (event) => {
    if (!inputValue) return;
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        setData([...data, createOption(inputValue)]);
        setInputValue('');
        event.preventDefault();
    }
  };


  return <Creatable
    components={components}
    inputValue={inputValue}
    isClearable
    isMulti
    menuIsOpen={false}
    onChange={(newValue) => {
      setData(newValue)
    }}
    onInputChange={(newValue) => setInputValue(newValue)}
    onKeyDown={handleKeyDown}
    placeholder="Type something and press enter..."
    value={data}
  />
}