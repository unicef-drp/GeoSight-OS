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
 * __author__ = 'francisco.perez@geomatico.es'
 * __date__ = '20/03/2024'
 * __copyright__ = ('Copyright 2024, Unicef')
 */

import { fetchingData } from "../../../../Requests";
import { buildGeojsonFromRelatedData } from "../../../../utils/relatedTable";
import { addPopup, hasLayer, hasSource } from "../utils";


const getBeforeLayerId = (map, layerId, contextLayerOrder) => {
  if (contextLayerOrder) {
    const contextLayerIdx = contextLayerOrder.indexOf(layerId)
    for (let idx = 0; idx < contextLayerOrder.length; idx++) {
      if (map && idx > contextLayerIdx) {
        const currentId = 'context-layer-' + contextLayerOrder[idx] + '-line'
        if (hasLayer(map, currentId)) {
          return currentId;
        }
      }
    }
  } else {
    return undefined;
  }
};


/***
 * Render vector tile layer
 */
export default function relatedTableLayer(map, id, data, contextLayerData, popupFeatureFn, contextLayerOrder) {
  // Create the source
  if (!contextLayerData.latitude_field || !contextLayerData.longitude_field || !contextLayerData.related_table) {
    return
  }

  fetchingData(
    `/api/related-table/${data.related_table}/data`, data.params, {}, (rtData) => {
      const geojson = buildGeojsonFromRelatedData(rtData, data.longitude_field, data.latitude_field, data.query)
      const params = Object.assign({}, data.params, {
        data: geojson,
        type: 'geojson',
      })

      if (!hasSource(map, id)) {
        map.addSource(id, params);
      } else {
        map.getSource(id).setData(geojson);
      }

      const popupFeature = (properties) => {
        return popupFeatureFn(properties, data?.data?.fields)
      }
      try {
        const layers = JSON.parse(contextLayerData.styles)
        let before = getBeforeLayerId(map, contextLayerData.id, contextLayerOrder)
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
  )
}