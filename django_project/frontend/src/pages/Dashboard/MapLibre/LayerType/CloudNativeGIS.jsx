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
 * __date__ = '06/06/2024'
 * __copyright__ = ('Copyright 2024, Unicef')
 */

import { addPopup, getBeforeLayerId, hasSource } from "../utils";
import { GET_RESOURCE } from "../../../../utils/ResourceRequests";
import { addLayerWithOrder } from "../Render";
import { Variables } from "../../../../utils/Variables";
import { dictDeepCopy } from "../../../../utils/main";


/***
 * Render CloudNativeGIS
 */
export default function cloudNativeGISLayer(map, id, data, contextLayerData, popupFeatureFn, contextLayerOrder) {
  (
    async () => {
      if (!data.cloud_native_gis_layer_id) {
        return
      }

      const info = await GET_RESOURCE.CLOUD_NATIVE_GIS.DETAIL(data.cloud_native_gis_layer_id)
      if (!info.tile_url) {
        return
      }
      const url = info.tile_url

      // We find the before layers
      let before = null
      if (contextLayerOrder) {
        const beforeOrder = getBeforeLayerId(map, id, contextLayerOrder)
        if (beforeOrder) {
          before = beforeOrder
        }
      }

      if (!hasSource(map, id)) {
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
        let layers = []
        contextLayerData = dictDeepCopy(contextLayerData)
        if (contextLayerData.styles) {
          layers = contextLayerData.styles
          if (typeof layers === 'string') {
            layers = JSON.parse(layers)
          }
        } else if (info.default_style?.style_url) {
          layers = await (await fetch(info.default_style?.style_url)).json()
          layers = layers.layers
        }
        layers.reverse().map(layer => {
          layer.id = id + '-' + layer.id
          layer.source = id
          layer['source-layer'] = 'default'
          addLayerWithOrder(map, layer, Variables.LAYER_CATEGORY.CONTEXT_LAYER, before)
          before = layer.id
          addPopup(map, layer.id, popupFeature)
        })
      } catch (e) {
        console.log(e)
      }
    }
  )()

}