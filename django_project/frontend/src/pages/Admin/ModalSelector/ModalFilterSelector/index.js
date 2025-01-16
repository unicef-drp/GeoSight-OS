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
import FormControl from "@mui/material/FormControl";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { FilterIcon } from "../../../../components/Icons";

import './style.scss';

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
