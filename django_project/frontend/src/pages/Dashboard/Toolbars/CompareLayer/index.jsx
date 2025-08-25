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
   CompareLayer
   ========================================================================== */

import React, { memo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plugin, PluginChild } from "../../MapLibre/Plugin";
import { Actions } from "../../../../store/dashboard";
import {
  CompareCheckedIcon,
  CompareUncheckedIcon,
} from "../../../../components/Icons";
import { isDashboardToolEnabled } from "../../../../utils/dashboardTool";
import { Variables } from "../../../../utils/Variables";

import "./style.scss";

/**
 * CompareLayer component.
 */
export function CompareLayer({ disabled = false }) {
  const dispatch = useDispatch();
  const compareMode = useSelector((state) => state.mapMode?.compareMode);
  const enabled = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.COMPARE_LAYERS),
  );

  /**
   * FIRST INITIATE
   * */
  useEffect(() => {
    if (disabled && compareMode) {
      dispatch(Actions.MapMode.changeCompareMode());
    }
  }, [disabled]);

  if (!enabled) {
    return null;
  }
  return (
    <Plugin>
      <div
        className="CompareLayerComponent Active"
        data-tool={Variables.DASHBOARD.TOOL.COMPARE_LAYERS}
      >
        <PluginChild
          title={(compareMode ? "Turn off" : "Turn on") + " compare Layers"}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              dispatch(Actions.MapMode.changeCompareMode());
            }
          }}
        >
          {compareMode ? <CompareCheckedIcon /> : <CompareUncheckedIcon />}
        </PluginChild>
      </div>
    </Plugin>
  );
}

export default memo(CompareLayer);
