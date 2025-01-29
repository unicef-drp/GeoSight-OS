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

const spatialMethods = [
  {
    "value": "INTERSECT",
    "name": "Intersect"
  },
  {
    "value": "DISTANCE WITHIN",
    "name": "Within"
  },
  {
    "value": "COMPLETELY WITHIN",
    "name": "Completely within"
  },
  {
    "value": "CENTROID WITHIN",
    "name": "Centroid within"
  }
]
const spatialMethodDistanceValue = "DISTANCE WITHIN"
/**
 * Spatial operator input
 * @param {string} data .
 * @param {Function} setData .
 * @param {Array} fields Fields of data.
 * @param {Array} onLoading If it is still loading.
 */
export default function SpatialOperator(
  { data, setData, fields, onLoading }
) {
  const [spatialMethod, spatialValue] = data.split('=')
  const [method, setMethod] = useState(spatialMethod)
  const [methodValue, setMethodValue] = useState(
    spatialValue ? spatialValue : 0
  )

  // Create default data
  useEffect(() => {
      if (!data) {
        setData('INTERSECT')
      } else {
        const [spatialMethod, spatialValue] = data.split('=')
        setMethod(spatialMethod)
        setMethodValue(spatialValue ? spatialValue : 0)
      }
    }, [data]
  )

  // Indicator list
  useEffect(() => {
      const values = []
      if (method !== null && method !== undefined) {
        values.push(method)
      }
      if (method === spatialMethodDistanceValue) {
        values.push(methodValue)
      }
      const value = values.join('=')
      if (value) {
        setData(values.join('='))
      } else {
        setData('INTERSECT')
      }
    }, [method, methodValue]
  )

  return <div className='InputInLine'>
    <div>
      <SelectWithList
        list={spatialMethods}
        disabled={!fields || onLoading}
        required={true}
        value={method}
        onChange={evt => {
          setMethod(evt.value)
        }}/>
      <span className="form-helptext">
        Spatial operator that will be used to determine the geometry of data.
      </span>
    </div>
    {
      method === spatialMethodDistanceValue ?
        <div className="BasicFormSection">
          <input
            type="number"
            placeholder={"Distance in meters."}
            value={methodValue}
            onChange={(evt) => {
              setMethodValue(evt.target.value)
            }}
          />
          <span className="form-helptext">Within in meters.</span>
        </div>
        : ""
    }
  </div>
}