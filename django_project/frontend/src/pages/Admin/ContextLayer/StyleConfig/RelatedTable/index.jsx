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
 * __author__ = 'fpsampayo@geomatico.es'
 * __date__ = '12/04/2024'
 * __copyright__ = ('Copyright 2024, Unicef')
 */

/* ==========================================================================
   ARCGIS STYLE
   ========================================================================== */

import React, { Fragment } from 'react';
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

import FieldConfig from "../../../../../components/FieldConfig";
import AggregationStyleConfig from "../AggregationStyleConfig";

/**
 * Map Config component.
 */
export default function RelatedTableConfig(
  {
    originalData,
    setData,
    RelatedTableData,
    useOverride = false,
    useOverrideLabel = true
  }
) {
  const data = JSON.parse(JSON.stringify(originalData))

  const update = () => {
    setData({ ...data })
  }
  return <Fragment>
    <div className='ArcgisConfig Fields'>
      {
        useOverride ?
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data?.override_field ? data?.override_field : false}
                  onChange={evt => {
                    setData({
                      ...data,
                      data_fields: RelatedTableData?.data?.fields,
                      override_field: evt.target.checked
                    })
                  }}/>
              }
              label="Override field config from default"/>
          </FormGroup> : null
      }
      {
        (!useOverride || data.override_field) ?
          data.data_fields ?
            <Fragment>
              <div className='ArcgisConfigFields'>
                <FieldConfig
                  data_fields={data.data_fields}
                  update={(fields) => {
                    data.data_fields = fields
                    update()
                  }}/>
              </div>
            </Fragment> : <div>Loading</div> : null
      }
    </div>
  </Fragment>
}
