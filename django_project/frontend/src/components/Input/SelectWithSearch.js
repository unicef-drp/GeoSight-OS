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

import React from "react";
import $ from 'jquery';
import { Checkbox, TextField } from "@mui/material";
import CheckBoxOutlineBlankIcon
  from '@mui/icons-material/CheckBoxOutlineBlank';
import InputAdornment from '@mui/material/InputAdornment';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { dictDeepCopy } from "../../utils/main";
import Autocomplete from "./Autocomplete";
import SelectWithSearchQuickSelection from "./SelectWithSearchQuickSelection";

import './style.scss';

/**
 * Select with placeholder
 * @param value Value of select.
 * @param {dict} options Options for selection.
 * @param {string} className Classname for Select.
 * @param {bool} disabled Is filter disabled or not.
 * @param {function} onChangeFn When the value changed.
 * @param props
 */
export function SelectWithSearch(
  {
    value, options, className, disabled = false, onChangeFn, ...props
  }
) {
  value = !value ? '' : value
  const isCompact = props.isCompact
  return <div className={'SelectWithSearchInput ' + props.parentClassName}>
    {props.iconStart ?
      <div className='IconStart'>{props.iconStart}</div> : null}
    <Autocomplete
      id={props?.id ? props.id : null}
      autoComplete={false}
      className={
        'SelectWithSearch ' +
        (isCompact ? 'Compact ' : '') +
        (props.fullWidth ? 'FullWidth ' : '') +
        (props.smallHeight ? 'SmallHeight ' : '') +
        (value.length === 0 ? 'NoValue ' : '') +
        (value.length > 1 ? 'MultipleValue ' : '') +
        className
      }
      value={value}
      options={options}
      disableCloseOnSelect={props.disableCloseOnSelect !== undefined ? props.disableCloseOnSelect : true}
      getOptionLabel={(option) => option}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={props.placeholder ? props.placeholder : 'Select 1 option'}
        />
      )}
      onChange={(event, values) => {
        if (onChangeFn) {
          onChangeFn(values ? values : '');
        } else if (props.onChange) {
          props.onChange(event);
        }
      }}
      disabled={disabled}
    />
  </div>
}

/**
 * Multiple Select with placeholder
 * @param value Value of select.
 * @param {dict} options Options for selection.
 * @param {str} className Classname for Select.
 * @param {bool} disabled Is filter disabled or not.
 * @param {function} onChangeFn When the value changed.
 * @param props
 */
export function MultipleSelectWithSearch(
  {
    value,
    options,
    className,
    disabled = false,
    onChangeFn,
    ...props
  }
) {
  const isCompact = props.isCompact
  const selectAllText = 'Select all'
  const allSelected = value.length === options.length && value.length > 0
  const optionsWithSelectAll = [selectAllText].concat(options)
  return <>
    <Autocomplete
      autoComplete={false}
      className={
        'MultipleSelectWithSearch ' +
        (isCompact ? 'Compact ' : '') +
        (props.fullWidth ? 'FullWidth ' : '') +
        (props.smallHeight ? 'SmallHeight ' : '') +
        (props.showValues ? 'ShowValues ' : '') +
        (value.length === 0 ? 'NoValue ' : '') +
        (value.length > 1 ? 'MultipleValue ' : '') +
        (value.length === options.length ? 'AllSelected ' : '') +
        className
      }
      value={value}
      disablePortal={true}
      options={dictDeepCopy(optionsWithSelectAll)}
      disableCloseOnSelect={props.disableCloseOnSelect !== undefined ? props.disableCloseOnSelect : true}
      getOptionLabel={(option) => option}
      renderOption={(props, option, { selected }) => {
        if (option === selectAllText && allSelected) {
          selected = true
        }
        return <li
          value={option} {...props}
          className={
            props.className + ' OptionMember ' + (isCompact ? 'Compact ' : '')
          }
        >
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon value={option} fontSize="small"/>}
            checkedIcon={<CheckBoxIcon value={option} fontSize="small"/>}
            value={option}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option}
        </li>
      }}
      renderInput={(params) => {
        if (props.showValues) {
          params.InputProps.placeholder = !value.length ? props.placeholder ? props.placeholder : 'Select 1 option' : ''
        } else {
          params.InputProps.placeholder = allSelected ? 'All selected' : value.length ? (value.length + ' selected') : props.placeholder ? props.placeholder : 'Select 1 option'
        }
        if (props?.quickSelection) {
          params.InputProps.startAdornment = (
            <InputAdornment
              position='end'
              className='MuiAutocomplete-endAdornment OtherOptions'>
              <SelectWithSearchQuickSelection
                value={value}
                options={options}
                onChange={val => {
                  onChangeFn(val)
                }}
              />
            </InputAdornment>
          )
        }
        return <TextField {...params}/>
      }}
      onChange={(e, values) => {
        if (e.target.getAttribute('value') === selectAllText || $(e.target).closest('li').attr('value') === selectAllText) {
          if (!allSelected) {
            onChangeFn(options);
          } else {
            onChangeFn([]);
          }
        } else {
          onChangeFn(values);
        }
      }}
      disabled={disabled}
      multiple
    />
  </>
}