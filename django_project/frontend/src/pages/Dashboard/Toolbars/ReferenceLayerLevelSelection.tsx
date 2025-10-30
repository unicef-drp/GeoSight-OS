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
 * __date__ = '30/11/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from "react";
import { useSelector } from "react-redux";
import { isDashboardToolEnabled } from "../../../selectors/dashboard";
import { Variables } from "../../../utils/Variables";
import { Plugin, PluginChild } from "../MapLibre/Plugin";
import ReferenceLayerSection from "../MiddlePanel/ReferenceLayer";

/**
 * Reference layer level selection
 */
export default function ReferenceLayerLevelSelection() {
  const referenceLayer = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.referenceLayer,
  );
  const levelSelectorEnable = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.LEVEL_SELECTOR),
  );
  return (
    <Plugin
      className={"ReferenceLayerToolbar"}
      hidden={!levelSelectorEnable || !referenceLayer?.identifier}
    >
      <div data-tool={Variables.DASHBOARD.TOOL.LEVEL_SELECTOR}>
        <PluginChild
          title={"Reference Layer selection"}
          className={"ReferenceLayerSelectorWrapper no-select"}
          active={true}
          disabled={false}
        >
          <ReferenceLayerSection />
        </PluginChild>
      </div>
    </Plugin>
  );
}
