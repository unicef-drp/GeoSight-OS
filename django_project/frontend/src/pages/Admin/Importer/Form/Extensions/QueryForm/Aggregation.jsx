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

export const AggregationMethod = {
  COUNT: "COUNT",
  SUM: "SUM",
  MAX: "MAX",
  MIN: "MIN",
  AVG: "AVG",
  MAJORITY: "MAJORITY",
  MINORITY: "MINORITY",
  EMPTY: "EMPTY"
}
export const aggregationOptions = [
  {
    value: AggregationMethod.COUNT,
    name: AggregationMethod.COUNT,
    type: "Number"
  },
  {
    value: AggregationMethod.SUM,
    name: AggregationMethod.SUM,
    type: "Number"
  },
  {
    value: AggregationMethod.MAX,
    name: AggregationMethod.MAX,
    type: "Number"
  },
  {
    value: AggregationMethod.MIN,
    name: AggregationMethod.MIN,
    type: "Number"
  },
  {
    value: AggregationMethod.AVG,
    name: AggregationMethod.AVG,
    type: "Number"
  },
  {
    value: AggregationMethod.MAJORITY,
    name: AggregationMethod.MAJORITY,
    type: "String"
  },
  {
    value: AggregationMethod.MINORITY,
    name: AggregationMethod.MINORITY,
    type: "String"
  },
  {
    value: AggregationMethod.MAJORITY,
    name: AggregationMethod.MAJORITY,
    type: "Number"
  },
  {
    value: AggregationMethod.MINORITY,
    name: AggregationMethod.MINORITY,
    type: "Number"
  }
];

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
  let aggregation = props.aggregationOptions ? props.aggregationOptions : aggregationOptions.filter(option => option.type === aggregateValueType)
  if (props.optional) {
    aggregation = [
      {
        value: AggregationMethod.EMPTY,
        name: "---------------------------",
        type: "Number"
      }, ...aggregation
    ]
  }
  const [spatialMethod, spatialValue] = data.split(/[()]+/)
  const [method, setMethod] = useState(spatialMethod)
  const [methodValue, setMethodValue] = useState(
    spatialValue ? spatialValue : ''
  )

  const fieldOptions = fields ? fields.filter(
    field => ['Number', 'number'].includes(field.type)
  ).map(field => field.name) : []

  useEffect(() => {
      let value = ''
      let methodUsed = method
      if (aggregation.length && !aggregation.map(aggr => aggr.value).includes(method)) {
        methodUsed = aggregation[0].value
      }
      if (methodUsed) {
        value = methodUsed
        if (![AggregationMethod.COUNT, AggregationMethod.EMPTY].includes(methodUsed)) {
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
        setData(props.optional ? AggregationMethod.EMPTY : AggregationMethod.COUNT)
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
        {props.helpText?.method ? props.helpText?.method : "Aggregation data per geometry that will be used to determine the value of the geometry."}
      </span>
    </div>
    {
      ![AggregationMethod.COUNT, AggregationMethod.EMPTY, ''].includes(method) ?
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