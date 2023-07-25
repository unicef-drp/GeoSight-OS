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

import React, { Fragment, useEffect, useState } from "react";
import { Input, } from "@mui/material";
import Slider from '@mui/material/Slider';
import {
  MultipleSelectWithSearch,
  SelectWithSearch,
} from "../../../../components/Input/SelectWithSearch";
import {
  IS_LIKE,
  IS_NOT_LIKE,
  IS_NOT_NULL,
  IS_NULL
} from "../../../../utils/queryExtraction"

/***
 * Filter Value Input
 * @param {str} field Field of filter.
 * @param {str} operator Operator of filter.
 * @param value Value og filter.
 * @param {dict} fieldData Field data that will be used.
 * @param {bool} disabled Is filter disabled or not.
 * @param {function} onChange When the filter change.
 */
export default function FilterValueInput(
  { field, operator, value, fieldData, disabled = false, onChange }
) {
  const [initValue, setInitValue] = useState(value);

  let min = null
  let max = null
  if (fieldData?.data) {
    const data = fieldData.data.filter(row => {
      return row !== undefined
    }).map(row => {
      return parseFloat(row)
    })
    min = Math.min(...data)
    max = Math.max(...data)
    if (isNaN(min)) {
      min = null
    }
    if (isNaN(max)) {
      max = null
    }
  }
  useEffect(() => {
    setInitValue(value)
    if (min && max && (initValue === undefined || initValue === '')) {
      setInitValue(0)
    }
  }, [value]);

  const needsValue = ![IS_NULL, IS_NOT_NULL].includes(operator)
  return <Fragment>
    {
      needsValue ?
        ['IN', 'NOT IN'].includes(operator) ?
          (
            fieldData ? <MultipleSelectWithSearch
              value={value} onChangeFn={onChange}
              options={fieldData.data}
              className='FilterInput'
              disabled={disabled}/> : ''
          ) :
          (
            ['=', '<>'].includes(operator) ?
              (
                fieldData ?
                  <SelectWithSearch
                    value={value} onChangeFn={onChange}
                    options={fieldData.data} className='FilterInput'
                    disabled={disabled}
                  /> : ''
              )
              :
              (
                [
                  '<', '<=', '>', '>=', IS_LIKE, IS_NOT_LIKE
                ].includes(operator) && (min === null || max === null) ?
                  <Input
                    className='FilterInput'
                    type="text"
                    placeholder="Value"
                    value={value}
                    onChange={(event) => {
                      onChange(event.target.value);
                    }}
                    disabled={disabled}
                  /> : (
                    <div className='FilterInput MuiInputSliderWithInput'>
                      <div className='MuiInputSlider'>
                        <Slider
                          value={initValue === '' ? 0 : parseFloat(initValue)}
                          step={max >= 5 ? 1 : max <= 1 ? 0.01 : 0.1}
                          min={min ? min : 0}
                          max={max ? max : 0}
                          onChange={(event) => {
                            setInitValue(event.target.value);
                          }}
                          track={['>', '>='].includes(operator) ? "inverted" : false}
                          onChangeCommitted={(e) => onChange(initValue)}
                          disabled={disabled}
                        />
                      </div>
                      <Input
                        value={initValue}
                        size="small"
                        onChange={(event) => {
                          onChange(event.target.value);
                        }}
                        inputProps={{
                          min: min,
                          max: max,
                          type: 'number',
                        }}
                        disabled={disabled}
                      />
                    </div>
                  )
              )
          )
        : ""
    }
  </Fragment>
}