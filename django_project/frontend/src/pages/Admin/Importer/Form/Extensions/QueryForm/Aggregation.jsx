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
import {
  SelectWithList
} from "../../../../../../components/Input/SelectWithList";
import './style.scss';

const aggregationOptions = [
  {
    value: "COUNT",
    name: "COUNT",
    type: "Number"
  },
  {
    value: "SUM",
    name: "SUM",
    type: "Number"
  },
  {
    value: "MAX",
    name: "MAX",
    type: "Number"
  },
  {
    value: "MIN",
    name: "MIN",
    type: "Number"
  },
  {
    value: "AVG",
    name: "AVG",
    type: "Number"
  },
  {
    value: "MAJORITY",
    name: "MAJORITY",
    type: "String"
  },
  {
    value: "MINORITY",
    name: "MINORITY",
    type: "String"
  },
  {
    value: "MAJORITY",
    name: "MAJORITY",
    type: "Number"
  },
  {
    value: "MINORITY",
    name: "MINORITY",
    type: "Number"
  }
];
const aggregationCount = "COUNT";

/**
 * Spatial operator input
 *  * @param {string} data .
 *  * @param {Function} setData .
 *  * @param {Array} fields Fields of data.
 *  * @param {Array} onLoading If it is still loading.
 *  * @param {string} aggregateValueType What is the value for the aggregation
 *  */
export default function Aggregation(
  { data, setData, fields, onLoading, aggregateValueType = 'Number', ...props }
) {
  const aggregation = aggregationOptions.filter(option => option.type === aggregateValueType)
  const [spatialMethod, spatialValue] = data.split(/[()]+/)
  const [method, setMethod] = useState(spatialMethod)
  const [methodValue, setMethodValue] = useState(
    spatialValue ? spatialValue : ''
  )

  const fieldOptions = fields ? fields.filter(
    field => ['Number'].includes(field.type)
  ).map(field => field.name) : []

  useEffect(() => {
      let value = ''
      let methodUsed = method
      if (aggregation.length && !aggregation.map(aggr => aggr.value).includes(method)) {
        methodUsed = aggregation[0].value
      }
      if (methodUsed) {
        value = methodUsed
        if (methodUsed !== aggregationCount) {
          if (methodValue && fieldOptions.includes(methodValue)) {
            value += `(${methodValue})`
          } else if (fieldOptions[0]) {
            value += `(${fieldOptions[0]})`
          }
        }
      }
      if (data !== value) {
        setData(value)
      }
    }, [method, methodValue, fields]
  )

  useEffect(() => {
      if (data) {
        const [spatialMethod, spatialValue] = data.split(/[()]+/)
        setMethod(spatialMethod)
        setMethodValue(spatialValue)
      } else {
        setData('COUNT')
      }
    }, [data]
  )
  return <div className='InputInLine'>
    <div>
      <SelectWithList
        isDisabled={!fields || onLoading || props.disabled}
        placeholder={onLoading ? "Loading" : "Select.."}
        list={aggregation}
        required={true}
        value={method}
        onChange={evt => {
          setMethod(evt.value)
        }}
      />
      <span className="form-helptext">
        Aggregation data per geometry that will be used to determine the value of the geometry.
      </span>
    </div>
    {
      method !== aggregationCount ?
        <div>
          <SelectWithList
            list={fieldOptions}
            placeholder={onLoading ? "Loading" : "Select.."}
            value={methodValue}
            isDisabled={onLoading || props.disabled}
            onChange={evt => {
              setMethodValue(evt.value)
            }}/>
          <span className="form-helptext">
            Select field to be aggregated.
          </span>
        </div>
        : ""
    }
  </div>
}