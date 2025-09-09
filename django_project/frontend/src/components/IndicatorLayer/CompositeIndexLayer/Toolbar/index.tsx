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
 * __date__ = '03/09/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */

/* ==========================================================================
   Composite Index Layer Toolbar
   ========================================================================== */

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Variables } from "../../../../utils/Variables";
import {
  Plugin,
  PluginChild,
} from "../../../../pages/Dashboard/MapLibre/Plugin";
import { LabelOffIcon, LabelOnIcon } from "../../../Icons";
import { Actions } from "../../../../store/dashboard";
import { isEligibleForCompositeLayer } from "../utilities";

import "./style.scss";

/**
 * Composite index layer toolbar component.
 */
export default function CompositeIndexLayerToolbar() {
  const dispatch = useDispatch();
  // @ts-ignore
  const compositeMode = useSelector((state) => state.mapMode.compositeMode);
  const currentIndicatorLayer = useSelector(
    // @ts-ignore
    (state) => state.selectedIndicatorLayer,
  );
  const enabled = isEligibleForCompositeLayer(currentIndicatorLayer);

  return (
    // @ts-ignore
    <Plugin>
      <div
        className="Active"
        data-tool={Variables.DASHBOARD.TOOL.COMPOSITE_INDEX_LAYER}
      >
        {/* @ts-ignore */}
        <PluginChild
          title={
            (compositeMode ? "Deactivate" : "Activate") +
            " composite index layer"
          }
          disabled={!enabled}
        >
          {compositeMode ? (
            <LabelOnIcon
              onClick={() => {
                if (enabled) {
                  dispatch(Actions.MapMode.toggleCompositeMode());
                }
              }}
            />
          ) : (
            <LabelOffIcon
              onClick={() => {
                if (enabled) {
                  dispatch(Actions.MapMode.toggleCompositeMode());
                }
              }}
            />
          )}
        </PluginChild>
      </div>
    </Plugin>
  );
}
