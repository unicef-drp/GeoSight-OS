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
import { IconTextField } from "../../../../components/Elements/Input";
import { ArrowDownwardIcon } from "../../../../components/Icons";

import './style.scss';

/**
 * Input modal selector component
 * @param {str} placeholder Placeholder of input.
 * @param {array} data Selected data.
 * @param {function} setData When the value changed.
 * @param {Boolean} isMultiple Is data returned multiple object.
 * @param {Boolean} showSelected Is Showing selected data.
 * @param {React.Component} children React component to be rendered.
 * @param {dict} props Other properties.
 */
export function ModalInputSelector(
  {
    placeholder, data, setData, isMultiple, showSelected, children, ...props
  }
) {
  const [open, setOpen] = useState(false)

  const updateData = (changedData) => {
    if (isMultiple) {
      setData(changedData)
    } else {
      if (changedData[0]) {
        setData([changedData[0]])
      } else {
        setData([])
      }
    }
  }
  let inputValue = data.length ? data.length + ' selected' : ''
  if (!isMultiple && data.length) {
    inputValue = data[0]?.name
  }
  return <FormControl className='InputControl'>
    {
      data.length && !props.hideLabel ?
        <label
          className="MuiFormLabel-root"
          data-shrink="true">{placeholder}</label>
        : ""
    }
    <IconTextField
      placeholder={placeholder}
      iconEnd={<ArrowDownwardIcon/>}
      onClick={() => setOpen(true)}
      value={inputValue}
      disabled={props.disabled}
    />
    {
      React.cloneElement(children, {
        open: open,
        setOpen: setOpen,
        selectedData: data,
        selectedDataChanged: updateData,
        isMultiple: isMultiple,
        showSelected: showSelected,
        ...props
      })
    }
  </FormControl>
}