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
   Popup Toolbars
   ========================================================================== */

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Variables } from "../../../../utils/Variables";
import { isDashboardToolEnabled } from "../../../../selectors/dashboard";
import { CompareLayer } from "../index";
import { Plugin, PluginChild } from "../../MapLibre/utils/Plugin";
import { Actions } from "../../../../store/dashboard";
import {
  ThreeDimensionOffIcon,
  ThreeDimensionOnIcon,
} from "../../../../components/Icons";
import maplibregl from "maplibre-gl";

interface Props {
  map: maplibregl.Map;
}

/** PopupToolbars */
export default function MapModeToolbars({ map }: Props) {
  const dispatch = useDispatch();
  // @ts-ignore
  const is3dMode = useSelector((state) => state.map?.is3dMode);
  const compareLayerEnabled = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.COMPARE_LAYERS),
  );
  const view3DEnable = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.VIEW_3D),
  );

  if (!compareLayerEnabled && !view3DEnable) {
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
      <CompareLayer disabled={is3dMode} />
      <Plugin hidden={!view3DEnable} className={""}>
        <div
          className="ExtrudedIcon Active"
          data-tool={Variables.DASHBOARD.TOOL.VIEW_3D}
        >
          <PluginChild
            title={"3D layer"}
            disabled={!map}
            active={is3dMode}
            onClick={() => {
              if (is3dMode) {
                map.easeTo({ pitch: 0 });
              }
              dispatch(Actions.Map.change3DMode(!is3dMode));
            }}
          >
            {is3dMode ? <ThreeDimensionOnIcon /> : <ThreeDimensionOffIcon />}
          </PluginChild>
        </div>
      </Plugin>
    </>
  );
}
