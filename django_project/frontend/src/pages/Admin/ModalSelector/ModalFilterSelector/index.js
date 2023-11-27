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
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { IconTextField } from "../../../../components/Elements/Input";
import IndicatorSelector from "../Indicator";

import { GeorepoViewSelector, GroupSelector, UserSelector } from "../index";
import { FilterIcon } from "../../../../components/Icons";

import './style.scss';

/**
 * Filter component
 * @param {str} placeholder Placeholder of input.
 * @param {array} data Selected data.
 * @param {function} setData When the value changed.
 * @param {Boolean} returnObject Is data returned whole object.
 * @param {React.Component} children React component to be rendered.
 */
export function ModalFilterSelector(
  { placeholder, data, setData, returnObject, children }
) {
  const [open, setOpen] = useState(false)

  const updateData = (changedData) => {
    setData(
      changedData.map(row => returnObject ? row : row.id)
    )
  }
  return <FormControl className='FilterControl'>
    {
      data.length ?
        <label
          className="MuiFormLabel-root"
          data-shrink="true">{placeholder}</label>
        : ""
    }
    <IconTextField
      iconEnd={<FilterIcon/>}
      onClick={() => setOpen(true)}
      value={data.length ? data.length + ' selected' : placeholder}
      inputProps={
        { readOnly: true, }
      }
    />
    {
      React.cloneElement(children, {
        open: open,
        setOpen: setOpen,
        selectedData: data,
        selectedDataChanged: updateData
      })
    }
  </FormControl>
}

/**
 * Filter indicator
 * @param {array} data Selected data.
 * @param {function} setData When the value changed.
 * @param {Boolean} returnObject Is data returned whole object.
 */
export function IndicatorFilterSelector({ data, setData, returnObject }) {
  return <ModalFilterSelector
    placeholder={'Filter by Indicator(s)'}
    data={data}
    setData={setData}
    returnObject={returnObject}
  >
    <IndicatorSelector/>
  </ModalFilterSelector>
}

/**
 * Filter Dataset
 * @param {array} data Selected data.
 * @param {function} setData When the value changed.
 * @param {Boolean} returnObject Is data returned whole object.
 */
export function DatasetFilterSelector({ data, setData, returnObject }) {
  return <ModalFilterSelector
    placeholder={'Filter by View(s)'}
    data={data}
    setData={setData}
    returnObject={returnObject}
  >
    <GeorepoViewSelector/>
  </ModalFilterSelector>
}

/**
 * Filter user
 * @param {array} data Selected data.
 * @param {function} setData When the value changed.
 * @param {Boolean} returnObject Is data returned whole object.
 */
export function UserFilterSelector({ data, setData, returnObject }) {
  return <ModalFilterSelector
    placeholder={'Filter by User(s)'}
    data={data}
    setData={setData}
    returnObject={returnObject}
  >
    <UserSelector/>
  </ModalFilterSelector>
}

/**
 * Filter group
 * @param {array} data Selected data.
 * @param {function} setData When the value changed.
 * @param {Boolean} returnObject Is data returned whole object.
 */
export function GroupFilterSelector({ data, setData, returnObject }) {
  return <ModalFilterSelector
    placeholder={'Filter by Group(s)'}
    data={data}
    setData={setData}
    returnObject={returnObject}
  >
    <GroupSelector/>
  </ModalFilterSelector>
}

/**
 * SelectFilter component
 */
export function SelectFilter({ title, data, setData, options }) {
  const handleChange = (evt) => {
    setData(evt.target.value);
  };
  return <FormControl className='MuiOutlinedInput-icon'>
    <InputLabel>{title}</InputLabel>
    <Select
      multiple
      value={data}
      onChange={handleChange}
      IconComponent={FilterIcon}
      input={<OutlinedInput label={title}/>}
      renderValue={(selected) => selected.length + ' selected'}
    >
      {options.map((option) => (
        <MenuItem key={option[0]} value={option[0]}>
          <Checkbox checked={data.indexOf(option[0]) > -1}/>
          <ListItemText primary={option[1]}/>
        </MenuItem>
      ))}
    </Select>
  </FormControl>
}
