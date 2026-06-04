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
 * __date__ = '04/06/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */
import maplibregl, { LayerSpecification } from "maplibre-gl";
import { changeTransparency } from "./index";
import $ from "jquery";

/** Apply transparency value to all indicator/reference layers and centroid charts. */
export const updateIndicatorLayerTransparency = (
  map: maplibregl.Map,
  transparency: number,
) => {
  if (map) {
    map
      .getStyle()
      .layers.filter(
        (layer: LayerSpecification) =>
          layer.id.startsWith("reference-layer-") ||
          layer.id.startsWith("indicator-label"),
      )
      .map((layer: LayerSpecification) =>
        changeTransparency(map, layer.id, transparency / 100),
      );
    $(".centroid-chart").css("opacity", transparency / 100);
  }
};

/** Apply transparency value to all context layers. */
export const updateContextLayerTransparency = (
  map: maplibregl.Map,
  transparency: number,
) => {
  if (map) {
    map
      .getStyle()
      .layers.filter((layer: LayerSpecification) =>
        layer.id.startsWith("context-layer-"),
      )
      .map((layer: LayerSpecification) =>
        changeTransparency(map, layer.id, transparency / 100),
      );
  }
};
