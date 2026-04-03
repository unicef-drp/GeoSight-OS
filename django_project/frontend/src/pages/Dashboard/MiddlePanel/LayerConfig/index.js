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
 * __date__ = '28/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from "react";
import { useSelector } from "react-redux";
import {
  isIndicatorLayerContentVisible
} from "../../../../selectors/dashboard";
import DynamicIndicatorLayerMapConfig from "./DynamicIndicatorLayerMapConfig";
import RelatedTableLayerMapConfig from "./RelatedTableLayerMapConfig";

import "./style.scss";

/** This is layer config component
 * Shows it on the middle of the panel
 */
export default function LayerConfig() {
  const indicatorLayerVisible = useSelector(isIndicatorLayerContentVisible());
  const { indicatorShow } = useSelector((state) => state.map);
  if (!indicatorLayerVisible || !indicatorShow) {
    return null;
  }
  return (
    <>
      <DynamicIndicatorLayerMapConfig />
      <RelatedTableLayerMapConfig />
    </>
  );
}
