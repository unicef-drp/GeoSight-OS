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
 * __date__ = '08/08/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from 'react';
import ReactAutocomplete from '@mui/material/Autocomplete';
import { ArrowDownwardIcon } from "../Icons";
import { isArray } from "chart.js/helpers";

export default function Autocomplete({ ...props }) {
  if (!isArray((props.value))) {
    if (props.value && !props.options.includes(props.value)) {
      props.options.push(props.value)
    }
  }
  return <ReactAutocomplete
    {...props}
    className={"ReactAutocomplete " + (props.className ? props.className : '')}
    popupIcon={<ArrowDownwardIcon/>}
  />
}
