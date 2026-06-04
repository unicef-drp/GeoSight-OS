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
   History Movement
   ========================================================================== */

import React, { Fragment, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HomeIcon } from "../../../../components/Icons";

import { Plugin, PluginChild } from "../../MapLibre/utils/Plugin";
import { isDashboardToolEnabled } from "../../../../selectors/dashboard";
import { Variables } from "../../../../utils/Variables";
import { Actions } from "../../../../store/dashboard";

/** Home button to back to the default extent*/
export function HomeButton() {
  const dispatch = useDispatch();
  const enable = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.BACK_TO_HOME),
  );
  const extent = useSelector((state) => state.dashboard.data?.extent);

  if (!enable) return null;
  return (
    <Fragment>
      <Plugin className={"MovementHistory"}>
        <div
          className={"Active"}
          data-tool={Variables.DASHBOARD.TOOL.BACK_TO_HOME}
        >
          <PluginChild
            title={Variables.DASHBOARD.TOOL.BACK_TO_HOME}
            disabled={!extent}
            onClick={() => {
              dispatch(
                Actions.Map.updateExtent([
                  [extent[0], extent[1]],
                  [extent[2], extent[3]],
                ]),
              );
            }}
          >
            <HomeIcon />
          </PluginChild>
        </div>
      </Plugin>
    </Fragment>
  );
}

export default memo(HomeButton);
