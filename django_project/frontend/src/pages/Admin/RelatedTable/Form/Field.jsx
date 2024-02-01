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
 * __date__ = '31/01/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useEffect, useRef, useState } from 'react';
import { Select } from "../../../../components/Input";


import './style.scss';

const optionsTypes = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
]
/** Arcgis Config Fields */
export default function FieldConfig({ data_fields, update }) {
  const [fields, setFields] = useState([]);
  const prevState = useRef();

  /** Update data **/
  const updateData = (newFields) => {
    setFields([...newFields])
    if (prevState.fields !== JSON.stringify(newFields)) {
      update(newFields)
      prevState.fields = JSON.stringify(newFields)
    }
  }

  // When the data changed
  useEffect(() => {
    setFields(data_fields)
  }, [data_fields])

  return <table className='FieldConfig'>
    <thead>
    <tr>
      <td valign="top">Field name</td>
      <td valign="top">Alias</td>
      <td valign="top">Type</td>
    </tr>
    </thead>
    <tbody>
    {
      fields.map(field => {
        let type = optionsTypes.find(opt => opt.value === field.type)
        if (!type) {
          field.type = 'string'
        }
        type = optionsTypes.find(opt => opt.value === field.type)
        return <tr key={field.id}>
          <td>{field.name}</td>
          <td>
            <input value={field.alias} onChange={(evt) => {
              field.alias = evt.target.value;
              updateData(fields)
            }}/>
          </td>
          <td>
            <Select
              options={optionsTypes} defaultValue={type}
              onChange={(evt) => {
                field.type = evt.value
                updateData(fields)
              }}/>
          </td>
        </tr>
      })
    }
    </tbody>
  </table>
}