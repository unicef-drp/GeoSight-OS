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
  const indicatorsData = useSelector(state => state.indicatorsData)
  const relatedTableData = useSelector(state => state.relatedTableData)
  const {
    indicators,
    indicatorLayers,
    relatedTables
  } = useSelector(state => state.dashboard.data)
  const [progress, setProgress] = useState(0);

  /** Update progress */
  useEffect(() => {
    let relatedTableCount = 0
    indicatorLayers.map(indicatorLayer => {
      const relatedTable = relatedTables.find(rt => rt.id === indicatorLayer.related_tables[0]?.id)
      if (!relatedTable) {
        return null
      }
      relatedTableCount += 1
    })
    const total = (indicators?.length ? indicators?.length : 0) + relatedTableCount
    let currProgress = 0
    for (const [key, value] of Object.entries(indicatorsData)) {
      if (!key.includes('layer') && value.fetched) {
        currProgress += 1
      }
    }
    for (const [key, value] of Object.entries(relatedTableData)) {
      if (!key.includes('og') && value.fetched) {
        currProgress += 1
      }
    }
    currProgress = currProgress * 100 / total
    if (currProgress < 10 || currProgress > progress) {
      setProgress(currProgress)
    }
  }, [indicatorsData, relatedTableData]);

  return <div className='DataLoadingProgress'>
    {
      progress < 100 ?
        <LinearProgress
          variant="determinate"
          value={progress}/> : null
    }
  </div>
}