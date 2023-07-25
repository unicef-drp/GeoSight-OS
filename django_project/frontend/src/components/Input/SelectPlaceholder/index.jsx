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

/* ==========================================================================
   Select with placeholder
   ========================================================================== */
import React, { useEffect, useState } from 'react';
import Select from "@mui/material/Select";
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from "@mui/material/MenuItem";

import './style.scss'

/**
 * Select with placeholder
 * @param {str} placeholder Placeholder.
 * @param {array} list list of data.
 * @param {str} initValue Value of input.
 * @param {string} className Class name.
 * @param {function} onChangeFn When the value changed.
 * @param {bool} disabled Isdisabled.
 */
export default function SelectPlaceholder(
  {
    placeholder,
    list,
    initValue,
    className = "",
    onChangeFn,
    disabled = false
  }
) {
  const [value, setValue] = useState(initValue ? initValue : 0);


  // Get indicator data
  useEffect(() => {
    const selectedID = list.filter((data) => {
      return (data.id && data.id === initValue) || (data === initValue)
    })
    if (selectedID.length === 0) {
      setValue(0);
    } else {
      setValue(initValue);
    }
  }, [initValue, list]);

  // Make list to a group
  const listInGroup = {}
  const listAndGroup = []
  if (list[0] && list[0].group) {
    list.forEach(data => {
      if (!listInGroup[data.group]) {
        listAndGroup.push(data.group);
        listInGroup[data.group] = [];
      }
      listAndGroup.push(data)
    })
  }

  return <Select
    onChange={
      event => {
        setValue(event.target.value);
        onChangeFn(event.target.value);
      }
    }
    value={value}
    className={value === 0 ? 'MuiInputBase-empty ' + className : className}
    renderValue={
      value => {
        let label
        if (listAndGroup.length > 0) {
          label = listAndGroup.find(val => val.id === value)
          if (label) {
            label = <div className='MuiSelectValue'>
              <div className='MuiSelectValueGroup'>{label.group}</div>
              <div>{label.name}</div>
            </div>
          }
        } else {
          label = list.find(val => val.id === value)?.name
        }

        if (!label) {
          label = placeholder
        }
        return label
      }
    }
    disabled={disabled}
  >
    <MenuItem
      key={0}
      value={0}
      className='MuiMenuItem-placeholder'
    >
      {placeholder}
    </MenuItem>
    {
      listAndGroup.length > 0 ? (
        listAndGroup.map(data => {
          return data.id ?
            <MenuItem
              key={data.id}
              value={data.id}>
              <div>{data.name}</div>
              {data.subName ?
                <div
                  className='MuiMenuItem-subname'>&nbsp;({data.subName})</div> : ''}
            </MenuItem> :
            <ListSubheader key={data}>{data}</ListSubheader>
        })
      ) : (
        list.map(data => {
          return <MenuItem
            key={data.id ? data.id : data}
            value={data.id ? data.id : data}>
            <div>{data.name ? data.name : data}</div>
            {
              data.subName ?
                <div
                  className='MuiMenuItem-subname'>&nbsp;({data.subName})</div> : ''
            }
          </MenuItem>
        })
      )
    }
  </Select>
}