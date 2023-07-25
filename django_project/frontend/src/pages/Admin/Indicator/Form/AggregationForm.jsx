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

import React, { Fragment, useState } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import Aggregation from "../../Importer/Form/Extensions/QueryForm/Aggregation";
import { AdminFormInput } from "../../Components/AdminForm/Base";


/*** Aggregation section ***/
export default function AggregationForm({}) {
  const selectableInput = batch !== null
  const [indicatorData, setIndicatorData] = useState(indicator);

  return <Fragment>
    <AdminFormInput
      selectableInput={selectableInput}
      attrName='aggregation_upper_level_allowed'>
      <input
        type="text" name="aggregation_upper_level_allowed"
        value={indicatorData.aggregation_upper_level_allowed ? 'true' : 'false'}
        hidden={true}
      />
      <FormControlLabel
        checked={indicatorData.aggregation_upper_level_allowed}
        control={<Checkbox/>}
        onChange={evt => {
          indicatorData.aggregation_upper_level_allowed = evt.target.checked
          setIndicatorData({ ...indicatorData })
        }}
        label={'Allow aggregation upper level'}/>
    </AdminFormInput>
    <AdminFormInput
      selectableInput={selectableInput}
      label='Aggregation upper level'
      attrName='aggregation_upper_level'>
      <Aggregation
        data={indicatorData.aggregation_upper_level ? indicatorData.aggregation_upper_level : ''}
        setData={newData => {
          indicatorData.aggregation_upper_level = newData
          setIndicatorData({ ...indicatorData })
        }}
        fields={
          [{
            'value': 'value',
            'name': 'value',
            'type': 'Number'
          }]
        }
        aggregateValueType={indicatorData.type !== 'String' ? "Number" : "String"}
      />
      <input
        type="text" name="aggregation_upper_level"
        value={indicatorData.aggregation_upper_level}
        hidden={true}
      />
    </AdminFormInput>
    <AdminFormInput
      selectableInput={selectableInput}
      label='Aggregation multiple values'
      attrName='aggregation_multiple_values'>
      <Aggregation
        data={indicatorData.aggregation_multiple_values ? indicatorData.aggregation_multiple_values : ''}
        setData={newData => {
          indicatorData.aggregation_multiple_values = newData
          setIndicatorData({ ...indicatorData })
        }}
        fields={
          [{
            'value': 'value',
            'name': 'value',
            'type': 'Number'
          }]
        }
        aggregateValueType={indicatorData.type !== 'String' ? "Number" : "String"}
      />
      <input
        type="text" name="aggregation_multiple_values"
        value={indicatorData.aggregation_multiple_values}
        hidden={true}
      />
    </AdminFormInput>
  </Fragment>
}