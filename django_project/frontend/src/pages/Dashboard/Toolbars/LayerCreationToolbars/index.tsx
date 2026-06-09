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
 * __date__ = '09/06/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */

/* ==========================================================================
   Toolbars for layer creation
   ========================================================================== */

import React from "react";
import { useSelector } from "react-redux";
import { Variables } from "../../../../utils/Variables";
import { isDashboardToolEnabled } from "../../../../selectors/dashboard";
import CompositeIndexLayerToolbar
  from "../../../../components/IndicatorLayer/CompositeIndexLayer/Toolbar";

import { SDMXLayerCreation } from "../SDMXLayerCreation";

/** Layer creation toolbars */
export default function LayerCreationToolbars() {
  const compositeIndexLayerEnabled = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.COMPOSITE_INDEX_LAYER),
  );
  const sdmxLayerCreationEnabled = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.SDMX_LAYER_CREATION),
  );

  if (!compositeIndexLayerEnabled && !sdmxLayerCreationEnabled) {
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
      {compositeIndexLayerEnabled && <CompositeIndexLayerToolbar />}
      {sdmxLayerCreationEnabled && <SDMXLayerCreation />}
    </>
  );
}
