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

/* ==========================================================================
   SUMMARY WIDGET EDITOR
   ========================================================================== */

import React, { Fragment, useEffect, useState } from 'react';
import { FormControl, InputLabel } from "@mui/material";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import EditSection from "../SummaryEditor"

/**
 * Edit section for widget.
 * @param {object} data Widget Data.
 * @param {object} selectedData selectedData Data.
 * @param {function} setAdditionalData selectedData Data.
 */
function _SummaryGroupWidgetEditSection(
  { data, selectedData, setAdditionalData }
) {
  const [property2, setProperty2] = useState(data.config.property_2 ? data.config.property_2 : '');

  // When state change, call setAdditionalData
  useEffect(() => {
    setAdditionalData({
      property_2: property2
    })
  }, [property2])

  return (
    <Fragment>
      <FormControl>
        <InputLabel>Grouping value</InputLabel>
        <Select
          onChange={(event) => {
            setProperty2(event.target.value)
          }}
          value={property2}
        >
          {
            Object.keys(selectedData).map((key, index) => (
              <MenuItem
                key={index}
                value={key}>{key}</MenuItem>
            ))
          }
        </Select>
      </FormControl>
    </Fragment>
  )
}

/**
 * Edit section for widget.
 * @param {bool} open Is open or close.
 * @param {Function} setData Set data function.
 * @param {object} data Widget Data.
 */
export default function SummaryGroupWidgetEditSection(
  { open, setData, data }
) {
  return <EditSection
    open={open} setData={setData} data={data} title={'Summary Group Widget'}>
    <_SummaryGroupWidgetEditSection/>
  </EditSection>
}
