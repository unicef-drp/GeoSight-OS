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

import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import LinearProgress from "@mui/material/LinearProgress";

import './style.scss';

/**
 * FullScreen component.
 */
export default function DataLoadingProgress() {
  const indicatorsMetadata = useSelector(state => state.indicatorsMetadata)
  const relatedTableData = useSelector(state => state.relatedTableData)
  const {
    indicatorLayers,
    relatedTables
  } = useSelector(state => state.dashboard.data)
  const [progress, setProgress] = useState(0);

  /** Update progress */
  useEffect(() => {
    let total = 0
    indicatorLayers.map(indicatorLayer => {
      const relatedTable = relatedTables.find(rt => rt.id === indicatorLayer.related_tables[0]?.id)
      if (!relatedTable) {
        return null
      }
      total += 1
    })
    let currProgress = 0

    for (const [key, value] of Object.entries(indicatorsMetadata)) {
      if (!key.includes('layer')) {
        if (value.progress?.page) {
          total += value.progress.page_size
          currProgress += value.progress.page
        }
      }
    }
    for (const [key, value] of Object.entries(relatedTableData)) {
      if (!key.includes('og') && value.fetched) {
        currProgress += 1
      }
    }
    currProgress = currProgress * 100 / total
    setProgress(currProgress)
  }, [indicatorsMetadata, relatedTableData]);

  return <div className='DataLoadingProgress'>
    {
      progress < 100 ?
        <LinearProgress
          variant="determinate"
          value={progress}/> : null
    }
  </div>
}