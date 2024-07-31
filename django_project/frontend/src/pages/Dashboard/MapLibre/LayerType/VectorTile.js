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

import { addPopup, getBeforeLayerId, hasLayer, hasSource } from "../utils";


/***
 * Render vector tile layer
 */
export default function vectorTileLayer(map, id, data, contextLayerData, popupFeatureFn, contextLayerOrder) {
  // Create the source
  if (!data.url) {
    return
  }

  // We find the before layers
  let before = 'reference-layer-fill';
  if (!hasLayer(map, before)) {
    before = null
  }
  if (contextLayerOrder) {
    const beforeOrder = getBeforeLayerId(map, id, contextLayerOrder)
    if (beforeOrder) {
      before = beforeOrder
    }
  }

  if (!hasSource(map, id)) {
    let url = data.url
    const params = Object.assign({}, data.params, {
      tiles: [url],
      type: 'vector',
      token: data.token,
      minZoom: 0
    })
    map.addSource(id, params);
  }
  const popupFeature = (properties) => {
    return popupFeatureFn(properties, data?.data?.fields)
  }
  try {
    const layers = JSON.parse(contextLayerData.styles)
    layers.map(layer => {
      layer.id = id + '-' + layer.id
      layer.source = id
      map.addLayer(layer, before)
      before = layer.id
      addPopup(map, layer.id, popupFeature)
    })
  } catch (e) {
    console.log(e)
  }
}