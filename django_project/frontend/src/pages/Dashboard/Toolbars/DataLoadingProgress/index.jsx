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
 * __date__ = '11/08/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Toggle Attributions
   ========================================================================== */

import React from 'react';
import { useSelector } from "react-redux";

import './style.scss';
import LinearProgress from "@mui/material/LinearProgress";

/**
 * FullScreen component.
 */
export default function DataLoadingProgress() {
  const indicatorsData = useSelector(state => state.indicatorsData)
  const relatedTableData = useSelector(state => state.relatedTableData)

  let total = 0
  let progress = 0
  for (const [key, value] of Object.entries(indicatorsData)) {
    total += 1
    if (value.fetched) {
      progress += 1
    }
  }
  for (const [key, value] of Object.entries(relatedTableData)) {
    total += 1
    if (value.fetched) {
      progress += 1
    }
  }
  return <div className='DataLoadingProgress'>
    {
      total !== progress ?
        <LinearProgress
          variant="determinate"
          value={progress * 100 / total}/> : null
    }
  </div>
}