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

import { IconTextField } from "../../../Elements/Input";
import { StyleSelector } from "../index";

import './style.scss';

/**
 * Filter component
 * @param {str} placeholder Placeholder of input.
 * @param {Array} selectedData Selected data.
 * @param {Function} selectedDataChanged Function of Selected data changed.
 * @param {boolean} isMultiple Is multiple selection.
 * @param {React.Component} iconStart React component to be rendered.
 * @param {React.Component} iconEnd React component to be rendered.
 * @param {React.Component} children React component to be rendered.
 */
export function ModalInputSelector(
  {
    placeholder, selectedData, selectedDataChanged, isMultiple,
    iconStart, iconEnd, children
  }
) {
  const [open, setOpen] = useState(false)

  // Placeholder name
  let placeholderInput = selectedData.length ? selectedData.length + ' selected' : placeholder
  if (!isMultiple) {
    placeholderInput = selectedData[0] ? selectedData[0].name : placeholder
  }

  return <FormControl className='ResourceInputControl'>
    <IconTextField
      iconStart={iconStart ? iconStart : ""}
      iconEnd={iconEnd ? iconEnd : ""}
      onClick={() => setOpen(true)}
      value={placeholderInput}
      inputProps={{ readOnly: true }}
    />
    {
      React.cloneElement(children, {
        open: open,
        setOpen: setOpen,
        selectedData: selectedData,
        selectedDataChanged: selectedDataChanged,
        isMultiple: isMultiple
      })
    }
    {
      selectedData.length ?
        <label
          className="MuiFormLabel-root"
          data-shrink="true">{placeholder}</label>
        : ""
    }
  </FormControl>
}

/**
 * Style with input selector
 * @param {str} placeholder Placeholder of input.
 * @param {Array} selectedData Selected data.
 * @param {Function} selectedDataChanged Function of Selected data changed.
 * @param {boolean} isMultiple Is multiple selection.
 */
export function StyleInputSelector(
  { placeholder, selectedData, selectedDataChanged, isMultiple }
) {
  return <ModalInputSelector
    placeholder={placeholder}
    selectedData={selectedData}
    selectedDataChanged={selectedDataChanged}
    isMultiple={isMultiple}
  >
    <StyleSelector/>
  </ModalInputSelector>
}
