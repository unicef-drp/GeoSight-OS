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

import React, { memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plugin, PluginChild } from "../../MapLibre/Plugin";
import { Actions } from "../../../../store/dashboard";
import { LabelOffIcon, LabelOnIcon } from "../../../../components/Icons";
import { isDashboardToolEnabled } from "../../../../utils/dashboardTool";
import { Variables } from "../../../../utils/Variables";

import "./style.scss";

/**
 * CompareLayer component.
 */
export function LabelToggler() {
  const dispatch = useDispatch();

  const enabled = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.MAP_LABEL_TOGGLE),
  );
  const showIndicatorMapLabel = useSelector(
    (state) => state.globalState?.showIndicatorMapLabel,
  );

  if (!enabled) {
    return null;
  }
  return (
    <Plugin>
      <div
        className="Active"
        data-tool={Variables.DASHBOARD.TOOL.MAP_LABEL_TOGGLE}
      >
        <PluginChild
          title={(showIndicatorMapLabel ? "Hide" : "Show") + " map labels"}
        >
          {showIndicatorMapLabel ? (
            <LabelOnIcon
              onClick={() => {
                dispatch(
                  Actions.GlobalState.update({ showIndicatorMapLabel: false }),
                );
              }}
            />
          ) : (
            <LabelOffIcon
              onClick={() => {
                dispatch(
                  Actions.GlobalState.update({ showIndicatorMapLabel: true }),
                );
              }}
            />
          )}
        </PluginChild>
      </div>
    </Plugin>
  );
}

export default memo(LabelToggler);
