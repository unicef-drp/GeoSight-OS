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
   Geometry Center
   ========================================================================== */

import { hasLayer, hasSource, removeLayer } from "../../utils";
import { addLayerWithOrder } from "../../Render";
import { Variables } from "../../../../../utils/Variables";
import { Logger } from "../../../../../utils/logger";
import { formatStyle } from "../../../../../utils/label.tsx";

export const INDICATOR_LABEL_ID = "indicator-label";
let lastFeatures = null;

/** Remove label **/
export const resetLabel = (map) => {
  lastFeatures = null;
  if (hasLayer(map, INDICATOR_LABEL_ID)) {
    removeLayer(map, INDICATOR_LABEL_ID);
  }
};

/** Show Label **/
export const showLabel = (map) => {
  if (hasLayer(map, INDICATOR_LABEL_ID)) {
    map.setLayoutProperty(INDICATOR_LABEL_ID, "visibility", "visible");
  }
  Logger.layers(map);
};

/** Hide Label **/
export const hideLabel = (map) => {
  if (hasLayer(map, INDICATOR_LABEL_ID)) {
    map.setLayoutProperty(INDICATOR_LABEL_ID, "visibility", "none");
  }
  Logger.layers(map);
};

/** Render label **/
export const renderLabel = (
  map,
  features,
  config
) => {
  if (JSON.stringify(features) === JSON.stringify(lastFeatures)) {
    return;
  }
  lastFeatures = features;

  const { paint, layout, minZoom, maxZoom } = formatStyle(config, features);
  if (hasLayer(map, INDICATOR_LABEL_ID)) {
    map.removeLayer(INDICATOR_LABEL_ID);
  }
  if (hasSource(map, INDICATOR_LABEL_ID)) {
    map.removeSource(INDICATOR_LABEL_ID);
  }
  map.addSource(INDICATOR_LABEL_ID, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: features,
    },
  });
  addLayerWithOrder(
    map,
    {
      id: "indicator-label",
      type: "symbol",
      source: INDICATOR_LABEL_ID,
      filter: ["==", "$type", "Point"],
      layout: layout,
      paint: paint,
      maxzoom: maxZoom,
      minzoom: minZoom,
    },
    Variables.LAYER_CATEGORY.LABEL,
  );
  Logger.layers(map);
};
