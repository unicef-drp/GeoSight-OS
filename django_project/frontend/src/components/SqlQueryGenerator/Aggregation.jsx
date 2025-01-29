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

import React, { useEffect, useState } from 'react';
import { SelectWithList } from "../Input/SelectWithList";

export const COUNT_UNIQUE = 'COUNT UNIQUE'
export const TYPES = {
  'COUNT': 'COUNT',
  'COUNT UNIQUE': COUNT_UNIQUE,
  'SUM': 'SUM',
  'MIN': 'MIN',
  'MAX': 'MAX',
  'AVG': 'AVG',
}
/**
 * Spatial operator input
 * @param {str} value Aggregation value.
 * @param {Function} setValue Set value Functions.
 * @param {Array} fields Fields of data.
 */
export default function Aggregation(
  { value, setValue, fields, isString = false }
) {
  const [spatialMethod, spatialValue] = value.split(/[()]+/)
  const [method, setMethod] = useState(spatialMethod)
  const [methodValue, setMethodValue] = useState(
    spatialValue ? spatialValue : ''
  )

  useEffect(() => {
      let value = ''
      if (method) {
        value = method + `(${methodValue})`
      }
      setValue(value)
    }, [method, methodValue]
  )

  useEffect(() => {
      const [spatialMethod, spatialValue] = value.split(/[()]+/)
      setMethod(spatialMethod)
      setMethodValue(spatialValue)
    }, [value]
  )

  const types = Object.keys(TYPES)
  if (isString) {
    types.push('MINORITY')
    types.push('MAJORITY')
  }
  return <div className="BasicFormSection">
    <label className={"form-label required"}>
      Aggregation data for value.
    </label>
    <div className='InputInLine'>
      <div className="BasicFormSection">
        <SelectWithList
          list={types}
          required={true}
          value={method}
          onChange={evt => {
            setMethod(evt.value)
          }}/>
        <span className="form-helptext">
          Aggregation data per geometry that will be used to determine the value of the geometry.
        </span>
      </div>
      <div className="BasicFormSection">
        <SelectWithList
          list={fields}
          value={methodValue}
          onChange={evt => {
            setMethodValue(evt.value)
          }}/>
        <span className="form-helptext">
          Select field to be aggregated.
        </span>
      </div>
    </div>
  </div>
}