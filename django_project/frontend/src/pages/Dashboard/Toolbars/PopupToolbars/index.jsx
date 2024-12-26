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
 * __date__ = '26/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Popup Toolbars
   ========================================================================== */

import React, { useRef } from 'react';
import { MeasurementTool } from "./Measurement";
import { ZonalAnalysisComponent } from "./ZonalAnalysis";

import './style.scss';

/**
 * PopupToolbars
 */
export default function PopupToolbars({ map }) {
  const measurementRef = useRef(null);
  const zonalAnalysisRef = useRef(null);
  return <>
    <MeasurementTool
      map={map} ref={measurementRef}
      started={() => zonalAnalysisRef?.current?.stop()}
    />
    <ZonalAnalysisComponent
      map={map} ref={zonalAnalysisRef}
      started={() => measurementRef?.current?.stop()}
    />
  </>
}