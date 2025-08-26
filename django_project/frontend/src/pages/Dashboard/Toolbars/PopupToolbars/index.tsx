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

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import maplibregl from "maplibre-gl";
import { useSelector } from "react-redux";
import { MeasurementTool } from "./Measurement";
import { ZonalAnalysisComponent } from "./ZonalAnalysis";
import { Variables } from "../../../../utils/Variables";
import { isDashboardToolEnabled } from "../../../../selectors/dashboard";

import "./style.scss";

interface Props {
  map: maplibregl.Map;
  started: () => void;
}

/**
 * PopupToolbars
 */
export const PopupToolbars = forwardRef(({ map }: Props, ref) => {
  const measurementRef = useRef(null);
  const zonalAnalysisRef = useRef(null);

  useImperativeHandle(ref, () => ({
    redrawMeasurement() {
      measurementRef?.current?.redraw();
    },
    isMeasurementToolActive() {
      measurementRef?.current?.isActive();
    },
    redrawZonalAnalysis() {
      zonalAnalysisRef?.current?.redraw();
    },
    isZonalAnalysisActive() {
      zonalAnalysisRef?.current?.isActive();
    },
  }));

  const measurementEnabled = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.MEASUREMENT),
  );
  const zonalAnalysisEnabled = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.ZONAL_ANALYSIS),
  );

  if (!measurementEnabled && !zonalAnalysisEnabled) {
    return null;
  }
  return (
    <>
      <div
        style={{
          borderLeft: "1px solid #E6E8E8",
          height: "30px",
          margin: "0 0.5rem",
        }}
      />
      {measurementEnabled && (
        <MeasurementTool
          map={map}
          ref={measurementRef}
          started={() => zonalAnalysisRef?.current?.stop()}
        />
      )}
      {zonalAnalysisEnabled && (
        <ZonalAnalysisComponent
          map={map}
          ref={zonalAnalysisRef}
          started={() => measurementRef?.current?.stop()}
        />
      )}
    </>
  );
});
