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
import {
  addPopup,
  getBeforeLayerId,
  hasSource,
  removeLayer,
  removeSource
} from "../utils";
import { toJson } from "../../../../utils/main";
import { addLayerWithOrder } from "../Render";
import { Variables } from "../../../../utils/Variables";


/***
 * Render vector tile layer
 */
export default function relatedTableLayer(map, id, data, contextLayerData, popupFeatureFn, contextLayerOrder) {
  const {
    field_aggregation,
    latitude_field,
    longitude_field,
    query
  } = toJson(data.configuration);
  if (!latitude_field || !longitude_field || !contextLayerData.related_table) {
    return
  }
  fetchingData(
    `/api/related-table/${data.related_table}/data`, data.params, {}, (rtData) => {
      const geojson = buildGeojsonFromRelatedData(rtData, longitude_field, latitude_field, query)
      const params = Object.assign({}, data.params, {
        data: geojson,
        type: 'geojson'
      })
      if (field_aggregation) {
        params.cluster = true
        params.clusterRadius = 50;
        params.clusterMaxZoom = 14
        params.clusterProperties = {
          sum: ["+", ["get", field_aggregation]],
          max: ["max", ["get", field_aggregation]],
          min: ["min", ["get", field_aggregation]]
        }
      }
      removeSource(map, id)

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
        let before = getBeforeLayerId(map, id, contextLayerOrder)
        layers.map(layer => {
          layer.id = id + '-' + layer.id
          layer.source = id
          removeLayer(map, layer.id)
          addLayerWithOrder(map, layer, Variables.LAYER_CATEGORY.CONTEXT_LAYER, before)
          before = layer.id
          addPopup(map, layer.id, popupFeature)
        })
      } catch (e) {
        console.log(e)
      }
    }
  )
}