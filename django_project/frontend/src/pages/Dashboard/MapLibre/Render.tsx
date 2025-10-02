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
 * __date__ = '03/02/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import { removeLayer } from "./utils";
import { Variables } from "../../../utils/Variables";
import maplibregl from "maplibre-gl";

export function addLayerWithOrder(
  map: maplibregl.Map, layerConfig: any, layerCategory: string,
  defaultBefore: string | null = null
) {
  let layers = map.getStyle().layers;
  let beforeId: string = layers.find(layer => layer.id === defaultBefore)?.id;

  removeLayer(map, layerConfig.id)
  switch (layerCategory) {
    case Variables.LAYER_CATEGORY.BASEMAP:
      const layers = map.getStyle().layers.filter(layer => layer.id !== 'basemap')
      beforeId = layers[0]?.id
      break;
    case Variables.LAYER_CATEGORY.CONTEXT_LAYER:
    case Variables.LAYER_CATEGORY.LABEL:
      if (!beforeId) {
        const layers = map.getStyle().layers.filter(layer => layer.id.includes('gl-draw'))
        beforeId = layers[0]?.id
      }
      break
  }
  map.addLayer(layerConfig, beforeId);
}